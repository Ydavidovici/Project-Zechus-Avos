const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
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

app.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
    const sig = request.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook signature verification failed. Error: ${err.message}`);
        return response.status(400).send(`Webhook signature verification failed. Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'payment_intent.succeeded':
                await updatePaymentStatus(event.data.object.id, 'Paid');
                break;
            default:
                console.error(`Unhandled event type ${event.type}`);
        }
        response.json({ received: true });
    } catch (err) {
        console.error(`Webhook handler error: ${err.message}`);
        response.status(400).send(`Webhook handler error: ${err.message}`);
    }
});

// Middleware to parse JSON
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
    const { items, metadata, successUrl, cancelUrl } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: metadata
        });

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        console.error("Error creating checkout session:", error.message);
        res.status(500).json({ error: error.message });
    }
});

async function updatePaymentStatus(paymentIntentId, status) {
    const sql = `UPDATE Sponsorships SET PaymentStatus = $1 WHERE PaymentIntentID = $2`;
    try {
        await pool.query(sql, [status, paymentIntentId]);
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
    } catch (err) {
        console.error(`Failed to update sponsorship: ${err.message}`);
    }
}

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
        res.status(500).json({ message: 'Database connection error', error: err.message });
    }
});

// Test static file serving
app.get('/test-file', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'HTML', 'index.html');
    console.log(`Attempting to serve file from: ${filePath}`);
    res.sendFile(filePath);
});

app.get('/debug', (req, res) => {
    const workingDirectory = __dirname;
    const publicHtmlPath = path.join(__dirname, 'public', 'HTML');
    fs.readdir(publicHtmlPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ workingDirectory, files });
    });
});

// List files in the public/html directory
app.get('/list-files', (req, res) => {
    const directoryPath = path.join(__dirname, 'public', 'HTML');
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

app.get('/api/sponsorships', async (req, res) => {
    const { seferId, isSponsored } = req.query;
    let query = "SELECT * FROM Sponsorships WHERE 1=1";
    const params = [];

    if (seferId) {
        query += " AND SeferID = $1";
        params.push(parseInt(seferId, 10));
    }

    if (isSponsored !== undefined) {
        if (params.length > 0) {
            query += " AND IsSponsored = $" + (params.length + 1);
        } else {
            query += " AND IsSponsored = $1";
        }
        params.push(isSponsored === 'true');
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
                return res.json({ success: true, message: "Login successful!" });
            } else {
                return res.status(401).json({ message: "Invalid credentials" });
            }
        } else {
            return res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.get('/admin', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    } else {
        return res.sendFile(path.join(__dirname, 'public', 'HTML', 'admin.html'));
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Failed to log out");
        } else {
            return res.redirect('/login');
        }
    });
});

app.get('/login', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public', 'HTML', 'login.html'));
});

app.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public', 'HTML', 'index.html'));
});

app.get('/success', (req, res) => {
    return res.sendFile(path.join(__dirname, 'public', 'HTML', 'success.html'));
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.use((req, res, next) => {
    return res.status(404).send('Sorry can’t find that!');
});

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ message: 'Something broke!', error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
});
