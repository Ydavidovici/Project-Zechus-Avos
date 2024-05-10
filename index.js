const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const stripe = require('stripe')('sk_test_51OttAEBCnbGynt76h5v1ud5DwOlCtvOMq0LTLaP9Hv4vGskNFBxThNlzF9p5hDjfPxTAwXBArWAz5l0cxMjBgUXe00liQiO4Gp');
const PORT = process.env.PORT || 3000;
const session = require('express-session');
require('dotenv').config();

// Middleware for parsing JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: process.env.SESSION_SECRET,  // Secret key to sign the session ID cookie
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

const dbPath = path.join(__dirname, 'db', 'pza.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error('Error opening database ' + err.message);
    else console.log('Database connected!');
});

// Logging middleware for debugging
app.use((req, res, next) => {
    console.log('Incoming Request:', req.method, req.path);
    console.log('Body:', req.body);
    next();
});


//const { formatDate, formatCurrency } = require('./utilities/dataFormatter');
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
            "data": rows // send raw data in cents
        });
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

app.post('/api/format/currency', (req, res) => {
    console.log("Received JSON body:", req.body);  // Log the entire body to review its structure
    if (req.body.amount === undefined) {
        return res.status(400).json({ error: 'Amount parameter is required.' });
    }

    try {
        const amount = parseInt(req.body.amount, 10);  // Ensure this conversion logic is correct
        if (isNaN(amount)) {
            throw new Error('Amount must be a valid number.');
        }
        const formattedAmount = formatCurrency(amount);
        res.json({ formattedAmount });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/create-checkout-session', async (req, res) => {
    console.log("Request to /api/create-checkout-session with body:", req.body);

    // Validate the incoming data
    if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
        console.error('Items array validation failed', req.body.items);
        return res.status(400).json({ error: 'Items array is required and must not be empty' });
    }
    if (!req.body.successUrl || !req.body.cancelUrl) {
        console.error('URL validation failed', req.body);
        return res.status(400).json({ error: 'Success and cancel URLs are required' });
    }

    try {
        const lineItems = req.body.items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.description,
                    metadata: item.metadata,
                },
                unit_amount: item.amount,
            },
            quantity: 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: req.body.successUrl,
            cancel_url: req.body.cancelUrl,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Failed to create checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session', details: error.message });
    }
});


app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sigHeader = req.headers['stripe-signature'];
    let event;

    try {
        // Verify the event by checking the signature
        event = stripe.webhooks.constructEvent(
            req.body,
            sigHeader,
            'sk_test_51OttAEBCnbGynt76h5v1ud5DwOlCtvOMq0LTLaP9Hv4vGskNFBxThNlzF9p5hDjfPxTAwXBArWAz5l0cxMjBgUXe00liQiO4Gp'
        );
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
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
    } catch (handleErr) {
        console.error(`Error handling event: ${handleErr.message}`);
        // Optionally send an email or alert to an admin if critical handling fails
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({received: true});
});


function handlePaymentIntentSucceeded(intent) {
    console.log(`PaymentIntent ${intent.id} succeeded`);

    // Update database to mark the order as paid
    db.run("UPDATE Orders SET status = ? WHERE paymentIntentId = ?", ['Paid', intent.id], function(err) {
        if (err) {
            console.error(`Database error: ${err.message}`);
            return;
        }
        console.log(`Order updated to Paid for PaymentIntent ID: ${intent.id}`);
    });
}

function handlePaymentIntentFailed(intent) {
    console.error(`PaymentIntent ${intent.id} failed with error: ${intent.last_payment_error?.message}`);

    // Update database to mark the order as payment failed
    db.run("UPDATE Orders SET status = ? WHERE paymentIntentId = ?", ['Payment Failed', intent.id], function(err) {
        if (err) {
            console.error(`Database error: ${err.message}`);
            return;
        }
        console.log(`Order updated to Payment Failed for PaymentIntent ID: ${intent.id}`);
    });
}

function handleChargeRefunded(charge) {
    console.log(`Charge ${charge.id} was refunded`);

    // Update database to record the refund
    db.run("UPDATE Transactions SET status = ? WHERE chargeId = ?", ['Refunded', charge.id], function(err) {
        if (err) {
            console.error(`Database error: ${err.message}`);
            return;
        }
        console.log(`Transaction updated to Refunded for Charge ID: ${charge.id}`);
    });
}



app.post('/api/format/currency', (req, res) => {
    if (!req.body.amount) {
        return res.status(400).json({ error: 'Amount is required' });
    }

    try {
        // Assuming amount is sent as cents and needs to be converted to a formatted string
        const formattedAmount = formatCurrency(parseInt(req.body.amount, 10));
        res.json({ formattedAmount });
    } catch (error) {
        res.status(500).json({ error: 'Error formatting amount' });
    }
});

// Data formatter utility
function formatCurrency(amount) {
    return `$${(amount / 100).toFixed(2)}`;
}

module.exports = { formatCurrency };

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

app.get('/payment-failed', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'payment-failure.html'));
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    db.get("SELECT password FROM Admins WHERE username = ?", [username], (err, row) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Internal server error" });
        }
        if (!row) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        bcrypt.compare(password, row.password, (error, isMatch) => {
            if (error) {
                console.error("bcrypt error:", error);
                return res.status(500).json({ message: "Error checking credentials" });
            }
            if (isMatch) {
                req.session.user = { username: username };
                res.json({ success: true, message: "Login successful!" });
            } else {
                res.status(401).json({ message: "Invalid credentials" });
            }
        });
    });
});


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