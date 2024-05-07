const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 3000;
const session = require('express-session');
require('dotenv').config();  // Load environment variables

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

const db = new sqlite3.Database('./backend/db/pza.db', err => {
    if (err) console.error('Error opening database ' + err.message);
    else console.log('Database connected!');
});

const emailHelper = require('./utilities/emailHelper');
const stripeHelper = require('./utilities/stripeHelper');
const { formatDate, formatCurrency } = require('./utilities/dataFormatter');
const webhookHelper = require('./utilities/webhookHelper');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files

// Serve index.html as the main file
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

app.patch('/api/seforim/:id', (req, res) => {
    db.run("UPDATE Seforim SET SeferName = ? WHERE SeferID = ?", [req.body.SeferName, req.params.id], function(err) {
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
app.get('/api/sponsorships', (req, res) => {
    db.all("SELECT * FROM Sponsorships", [], (err, rows) => {
        if (err) res.status(400).json({ "error": err.message });
        else res.json({ "message": "success", "data": rows.map(row => ({ ...row, Amount: formatCurrency(row.Amount) })) });
    });
});

app.get('/api/sponsorships/:id', (req, res) => {
    db.get("SELECT * FROM Sponsorships WHERE SponsorshipID = ?", [req.params.id], (err, row) => {
        if (err) res.status(400).json({ "error": err.message });
        else res.json({ "message": "success", "data": row });
    });
});

app.post('/api/sponsorships', (req, res) => {
    const { SeferID, Type, TypeDetail, IsSponsored, SponsorName, ForWhom, PaymentStatus } = req.body;
    db.run("INSERT INTO Sponsorships (SeferID, Type, TypeDetail, IsSponsored, SponsorName, ForWhom, PaymentStatus) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [SeferID, Type, TypeDetail, IsSponsored ? 1 : 0, SponsorName, ForWhom, PaymentStatus], function(err) {
            if (err) res.status(400).json({ "error": err.message });
            else res.json({ "message": "success", "data": this.lastID });
        });
});

// Payment Link API
app.post('/api/create-payment-link', async (req, res) => {
    const { description, amount, metadata } = req.body;
    try {
        const url = await stripeHelper.createPaymentLink(description, amount, metadata);
        res.json({ "message": "success", "url": url });
    } catch (error) {
        res.status(500).json({ "message": "Stripe payment link creation failed", "error": error.message });
    }
});

// Webhooks
app.post('/webhooks/stripe', bodyParser.raw({type: 'application/json'}), (req, res) => {
    const event = webhookHelper.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    try {
        webhookHelper.handleEvent(event);
        res.status(200).json({ "received": true });
    } catch (err) {
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Assuming db.get() fetches your hashed password and compares it
    db.get("SELECT password FROM Admins WHERE username = ?", [username], function(err, row) {
        if (err) {
            return res.status(500).send("Internal server error");
        }
        if (!row) {
            return res.status(401).send("Invalid credentials");
        }
        bcrypt.compare(password, row.password, (err, result) => {
            if (result) {
                req.session.user = { username: username };
                res.json({ success: true });
            } else {
                res.status(401).send("Invalid credentials");
            }
        });
    });
});

function checkAuthentication(req, res, next) {
    if (req.session.user && req.session.user.username) {
        next(); // User is logged in, proceed to the next function (or route)
    } else {
        res.redirect('/login.html'); // User is not logged in, redirect to login page
    }
}

// Use the middleware to protect the admin page route
app.get('/admin.html', checkAuthentication, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'admin.html'));
});

app.use('/admin/*', checkAuthentication); // Protect all routes under /admin


app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.redirect('/login.html'); // Redirect to login page after logout
    });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});