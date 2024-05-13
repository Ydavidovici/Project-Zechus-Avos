const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PORT = process.env.PORT || 3000;
const session = require('express-session');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
    const sig = request.headers['stripe-signature'];
    try {
        const event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'payment_intent.succeeded':
                await updatePaymentStatus(event.data.object.id, 'Paid');
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        response.json({received: true});
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        response.status(400).send(`Webhook Error: ${err.message}`);
    }
});

async function updatePaymentStatus(paymentIntentId, status) {
    const sql = `UPDATE Sponsorships SET PaymentStatus = $1 WHERE PaymentIntentID = $2`;
    try {
        await pool.query(sql, [status, paymentIntentId]);
        console.log(`Payment status updated to ${status} for PaymentIntent ID: ${paymentIntentId}`);
    } catch (err) {
        console.error(`Error updating payment status: ${err.message}`);
    }
}

async function handleCheckoutSessionCompleted(session) {
    const { metadata } = session;
    if (metadata && metadata.sponsorshipId) {
        const { sponsorshipId, sponsorName, forWhom } = metadata;
        await updateSponsorshipStatus(sponsorshipId, 'Paid', sponsorName, forWhom);
    } else {
        console.error('No sponsorshipId provided in session metadata');
    }
}

async function updateSponsorshipStatus(sponsorshipId, status, sponsorName, forWhom) {
    const sql = `UPDATE Sponsorships SET PaymentStatus = $1, SponsorName = $2, ForWhom = $3, IsSponsored = true WHERE SponsorshipID = $4`;
    try {
        await pool.query(sql, [status, sponsorName, forWhom, sponsorshipId]);
        console.log(`Sponsorship ${sponsorshipId} updated with status ${status}`);
    } catch (err) {
        console.error(`Failed to update sponsorship: ${err.message}`);
    }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000  // 24 hours
    }
}));

// Test database connection
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: 'Database connected', time: result.rows[0] });
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(500).json({ message: 'Database connection error', error: err.message });
    }
});

// Test static file serving
app.get('/test-file', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// List files in the public/html directory
app.get('/list-files', (req, res) => {
    const directoryPath = path.join(__dirname, 'public', 'html');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to scan directory' });
        }
        res.json({ files });
    });
});

// Define routes for seforim operations
app.get('/api/seforim', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Seforim");
        res.json({ message: "success", data: result.rows });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/seforim/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM Seforim WHERE SeferID = $1", [id]);
        res.json({ message: "success", data: result.rows[0] });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/seforim', async (req, res) => {
    const { SeferName } = req.body;
    try {
        const result = await pool.query("INSERT INTO Seforim (SeferName) VALUES ($1) RETURNING *", [SeferName]);
        res.json({ message: "success", data: result.rows[0] });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Define routes for sponsorships operations
app.get('/api/sponsorships', async (req, res) => {
    const { seferId, isSponsored } = req.query;
    let query = "SELECT * FROM Sponsorships WHERE 1=1";
    const params = [];
    if (seferId) {
        query += " AND SeferID = $1";
        params.push(seferId);
    }
    if (isSponsored !== undefined) {
        query += " AND IsSponsored = $2";
        params.push(isSponsored === 'true' ? true : false);
    }
    try {
        const result = await pool.query(query, params);
        res.json({ message: "success", data: result.rows });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/sponsorships', async (req, res) => {
    const { SeferID, Type, TypeDetail, Amount, IsSponsored, SponsorName, SponsorContact, ForWhom, PaymentStatus, PaymentIntentID } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO Sponsorships (SeferID, Type, TypeDetail, Amount, IsSponsored, SponsorName, SponsorContact, ForWhom, PaymentStatus, PaymentIntentID) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
            [SeferID, Type, TypeDetail, Amount, IsSponsored, SponsorName, SponsorContact, ForWhom, PaymentStatus, PaymentIntentID]
        );
        res.json({ message: "success", data: result.rows[0] });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.patch('/api/sponsorships/:id', async (req, res) => {
    const { id } = req.params;
    const { IsSponsored } = req.body;
    try {
        const result = await pool.query("UPDATE Sponsorships SET IsSponsored = $1 WHERE SponsorshipID = $2 RETURNING *", [IsSponsored, id]);
        res.json({ message: "success", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/seforim/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM Seforim WHERE SeferID = $1 RETURNING *", [id]);
        if (result.rows.length > 0) {
            res.json({ message: "deleted", data: result.rows[0] });
        } else {
            res.status(404).send('Sefer not found');
        }
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/sponsorships/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM Sponsorships WHERE SponsorshipID = $1 RETURNING *", [id]);
        if (result.rows.length > 0) {
            res.json({ message: "deleted", data: result.rows[0] });
        } else {
            res.status(404).send('Sponsorship not found');
        }
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query("SELECT password FROM Admins WHERE username = $1", [username]);
        if (result.rows.length > 0) {
            const match = await bcrypt.compare(password, result.rows[0].password);
            if (match) {
                req.session.user = { username };
                res.json({ success: true, message: "Login successful!" });
            } else {
                res.status(401).json({ message: "Invalid credentials" });
            }
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.status(500).send("Failed to log out");
        } else {
            res.redirect('/login');
        }
    });
});

app.get('/admin', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        res.sendFile(path.join(__dirname, 'public', 'html', 'admin.html'));
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'success.html'));
});

app.use((req, res, next) => {
    res.status(404).send('Sorry can’t find that!');
});

app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
