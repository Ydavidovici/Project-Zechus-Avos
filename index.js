const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const session = require('express-session');
require('dotenv').config();
console.log("Stripe Key Loaded:", !!process.env.STRIPE_SECRET_KEY);  // Will log 'true' if the key is loaded
const logger = require('morgan');
app.use(logger('dev'));

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    console.log('Incoming Request:', req.method, req.path);
    next();
});

app.use(express.json());

app.use((req, res, next) => {
    console.log('Parsed Body:', req.body);
    next();
});


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


const dbPath = path.join(__dirname, 'db', 'pza.db');
console.log("Database path:", dbPath);
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error opening database ' + err.message);
    else console.log('Database connected!');
});

const { formatDate, formatCurrency } = require('./utilities/dataFormatter');
const webhookHelper = require('./utilities/webhookHelper');
const { createCheckoutSession } = require('./utilities/stripeHelper');

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
    console.log('Received POST request:', req.body);
    res.json({ message: "POST received", data: req.body });
});

/*
app.post('/api/sponsorships', (req, res) => {
    console.log('Received data for sponsorship:', req.body);
    const { SeferID, Type, TypeDetail, Amount, IsSponsored, SponsorName, SponsorContact, ForWhom, PaymentStatus, PaymentIntentID } = req.body;

    console.log('Preparing to run database operation...');
    db.run("INSERT INTO Sponsorships (SeferID, Type, TypeDetail, Amount, IsSponsored, SponsorName, SponsorContact, ForWhom, PaymentStatus, PaymentIntentID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [SeferID, Type, TypeDetail, Amount, IsSponsored ? 1 : 0, SponsorName, SponsorContact, ForWhom, PaymentStatus, PaymentIntentID], function(err) {
            if (err) {
                console.error('Error executing database query:', err.message);
                return res.status(400).json({ "error": err.message });
            }
            console.log('Insert successful, ID:', this.lastID);
            res.json({ "message": "success", "data": this.lastID });
        });
    console.log('Database operation initiated.');
});
*/


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

app.post('/api/create-checkout-session', async (req, res) => {
    const { items, successUrl, cancelUrl } = req.body;  // Expect items to be an array of { description, amount, quantity, metadata }
    try {
        const session = await createCheckoutSession(items, successUrl, cancelUrl);
        res.json({ sessionId: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sigHeader = req.headers['stripe-signature'];
    let event;

    try {
        event = webhookHelper.constructEvent(req.body, sigHeader, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Process the event
    switch (event.type) {
        case 'checkout.session.completed':
            handleCheckoutSessionCompleted(event.data.object);
            break;
        case 'payment_intent.succeeded':
            handlePaymentIntentSucceeded(event.data.object);
            break;
        case 'payment_intent.payment_failed':
            handlePaymentIntentFailed(event.data.object);
            break;
        case 'charge.refunded':
            handleChargeRefunded(event.data.object);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true }); // Acknowledge receipt of the webhook
});


function handleCheckoutSessionCompleted(session) {
    const sponsorshipId = session.metadata && session.metadata.sponsorshipId;
    if (!sponsorshipId) {
        console.error('No sponsorshipId provided in session metadata');
        return; // Properly handle the error scenario, possibly alerting an admin
    }
    updateSponsorshipStatus(sponsorshipId, 'Paid');
}

// Ensure you handle updates in a central function that can process different statuses
function updateSponsorshipStatus(sponsorshipId, status) {
    const query = "UPDATE Sponsorships SET PaymentStatus = ? WHERE SponsorshipID = ?";
    db.run(query, [status, sponsorshipId], function(err) {
        if (err) {
            console.error('Database update failed:', err);
            return;
        }
        console.log(`Sponsorship ${sponsorshipId} updated to ${status}`);
    });
}


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT password FROM Admins WHERE username = ?", [username], (err, row) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
        if (!row) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (bcrypt.compareSync(password, row.password)) {
            req.session.user = { username: username };
            res.json({ success: true }); // Change here to handle fetch appropriately
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    });
});


// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Failed to log out");
        }
        res.redirect('/login');
    });
});

app.get('/admin', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.sendFile(path.join(__dirname, 'public', 'html',  'admin.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});


app.get('/success', (req, res) => {
    // Additional server-side logic could be performed here if necessary
    res.sendFile(path.join(__dirname, 'public', 'html', 'success.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

// Make sure this is below your route definitions
app.use((req, res, next) => {
    res.status(404).send('Sorry can’t find that!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
