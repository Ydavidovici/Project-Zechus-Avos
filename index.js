const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const session = require('express-session');
require('dotenv').config();

app.use(session({
    secret: process.env.SESSION_SECRET,  // Secret key to sign the session ID cookie
    resave: false,                      // Avoid resaving session if unmodified
    saveUninitialized: false,           // Don't create session until something stored
    cookie: {
        secure: process.env.NODE_ENV === 'production',  // Use secure cookies in production
        httpOnly: true,                  // Prevent client-side JS from reading the cookie
        maxAge: 24 * 60 * 60 * 1000      // Set cookie expiration time (e.g., 24 hours)
    }
}));


const db = new sqlite3.Database('./db/pza.db', err => {
    if (err) console.error('Error opening database ' + err.message);
    else console.log('Database connected!');
});

const emailHelper = require('./utilities/emailHelper');
const stripeHelper = require('./utilities/stripeHelper');
const { formatDate, formatCurrency } = require('./utilities/dataFormatter');
const webhookHelper = require('./utilities/webhookHelper');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// Seforim CRUD operations
app.get('/api/seforim', (req, res) => {
    db.all("SELECT * FROM Seforim", [], (err, rows) => {
        if (err) res.status(400).json({ "error": err.message });
        else res.json({ "message": "success", "data": rows });
    });
});

app.get('/api/seforim/:id', (req, res) => {
    db.get("SELECT * FROM Seforim WHERE SeferID = ?", [req.params.id], (err, row) => {
        if (err) res.status(400).json({ "error": err.message });
        else res.json({ "message": "success", "data": row });
    });
});

app.post('/api/seforim', (req, res) => {
    const { SeferName } = req.body;
    db.run("INSERT INTO Seforim (SeferName) VALUES (?)", [SeferName], function(err) {
        if (err) res.status(400).json({ "error": err.message });
        else res.json({ "message": "success", "data": this.lastID });
    });
});

app.patch('/api/sponsorships/:id', (req, res) => {
    const { IsSponsored, PaymentStatus, SponsorName, SponsorContact, ForWhom } = req.body;
    db.run("UPDATE Sponsorships SET IsSponsored = ?, PaymentStatus = ?, SponsorName = ?, SponsorContact = ?, ForWhom = ? WHERE SponsorshipID = ?",
        [IsSponsored ? 1 : 0, PaymentStatus, SponsorName, SponsorContact, ForWhom, req.params.id], function(err) {
            if (err) res.status(400).json({ "error": err.message });
            else res.json({ "message": "success", "data": this.changes });
        });
});


app.delete('/api/seforim/:id', (req, res) => {
    db.run("DELETE FROM Seforim WHERE SeferID = ?", [req.params.id], function(err) {
        if (err) res.status(400).json({ "error": err.message });
        else res.json({ "message": "deleted", "rows": this.changes });
    });
});

// Sponsorships CRUD operations
// Endpoint to fetch sponsorships with optional filters
app.get('/api/sponsorships', (req, res) => {
    const { seferId, isSponsored } = req.query;
    let query = "SELECT * FROM Sponsorships WHERE 1 = 1";
    const params = [];

    if (seferId) {
        query += " AND SeferID = ?";
        params.push(seferId);
    }

    if (isSponsored !== undefined) {
        query += " AND IsSponsored = ?";
        params.push(isSponsored === 'true' ? 1 : 0);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows.map(row => ({
                ...row,
                Amount: formatCurrency(row.Amount)
            }))
        });
    });
});


app.get('/api/sponsorships/:id', (req, res) => {
    db.get("SELECT * FROM Sponsorships WHERE SponsorshipID = ?", [req.params.id], (err, row) => {
        if (err) res.status(400).json({ "error": err.message });
        else res.json({ "message": "success", "data": row });
    });
});

app.post('/api/sponsorships', (req, res) => {
    const { SeferID, Type, TypeDetail, Amount, IsSponsored, SponsorName, SponsorContact, ForWhom, PaymentStatus, PaymentIntentID } = req.body;
    db.run("INSERT INTO Sponsorships (SeferID, Type, TypeDetail, Amount, IsSponsored, SponsorName, SponsorContact, ForWhom, PaymentStatus, PaymentIntentID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [SeferID, Type, TypeDetail, Amount, IsSponsored ? 1 : 0, SponsorName, SponsorContact, ForWhom, PaymentStatus, PaymentIntentID], function(err) {
            if (err) res.status(400).json({ "error": err.message });
            else res.json({ "message": "success", "data": this.lastID });
        });
});

app.patch('/api/sponsorships/:id', (req, res) => {
    const { Type, TypeDetail, Amount, IsSponsored, SponsorName, SponsorContact, ForWhom, PaymentStatus, PaymentIntentID } = req.body;
    db.run("UPDATE Sponsorships SET Type = ?, TypeDetail = ?, Amount = ?, IsSponsored = ?, SponsorName = ?, SponsorContact = ?, ForWhom = ?, PaymentStatus = ?, PaymentIntentID = ? WHERE SponsorshipID = ?",
        [Type, TypeDetail, Amount, IsSponsored ? 1 : 0, SponsorName, SponsorContact, ForWhom, PaymentStatus, PaymentIntentID, req.params.id], function(err) {
            if (err) res.status(400).json({ "error": err.message });
            else res.json({ "message": "success", "data": this.changes });
        });
});

app.delete('/api/sponsorships/:id', (req, res) => {
    db.run("DELETE FROM Sponsorships WHERE SponsorshipID = ?", [req.params.id], function(err) {
        if (err) res.status(400).json({ "error": err.message });
        else res.json({ "message": "deleted", "rows": this.changes });
    });
});

// Admin authentication routes
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT password FROM Admins WHERE username = ?", [username], (err, row) => {
        if (err) {
            res.status(500).send("Internal server error");
        } else if (row && bcrypt.compareSync(password, row.password)) {
            req.session.user = { username: username };
            res.json({ success: true });
        } else {
            res.status(401).send("Invalid credentials");
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/login.html');
    });
});

app.post('/api/create-payment-link', async (req, res) => {
    const { description, amount, metadata } = req.body;
    try {
        const paymentLink = await stripeHelper.createPaymentLink(description, amount, metadata);
        res.json({ url: paymentLink.url });
    } catch (error) {
        res.status(500).json({ message: "Stripe payment link creation failed", error: error.message });
    }
});

app.post('/send-email', async (req, res) => {
    const { to, subject, message } = req.body;
    try {
        await emailHelper.sendEmail(to, subject, message);
        res.json({ success: true, message: "Email sent successfully." });
    } catch (error) {
        console.error("Failed to send email:", error);
        res.status(500).json({ success: false, message: "Failed to send email." });
    }
});

app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const event = webhookHelper.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        // Assume metadata contains sponsorshipId
        const sponsorshipId = paymentIntent.metadata.sponsorshipId;

        db.run("UPDATE Sponsorships SET PaymentStatus = 'Paid', PaymentIntentID = ? WHERE SponsorshipID = ?",
            [paymentIntent.id, sponsorshipId], function(err) {
                if (err) {
                    console.error('Failed to update payment status:', err);
                    res.status(500).send('Database update failed');
                } else {
                    res.status(200).send('Payment status updated successfully');
                }
            });
    } else {
        res.status(200).send('Webhook received unknown event type');
    }
});

app.get('/admin', (req, res) => {
    if (!req.session.user) {
        return res.status(401).redirect('html/login.html'); // Redirect to login if not authenticated
    }
    res.sendFile(path.join(__dirname, 'public', 'html', 'admin.html'));
});


app.get('/success', (req, res) => {
    // Additional server-side logic could be performed here if necessary
    res.sendFile(path.join(__dirname, 'public', 'html', 'success.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
