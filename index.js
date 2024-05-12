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


const db = new sqlite3.Database('./db/pza.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) console.error('Error opening database: ' + err.message);
});

app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
        console.log('Handled event type:', event.type);

        switch (event.type) {
            case 'checkout.session.completed':
                console.log('Handling checkout.session.completed', event.data.object);
                handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log(`Handling payment_intent.succeeded for PaymentIntent ID: ${paymentIntent.id}`);
                updatePaymentStatus(paymentIntent.id, 'Paid');
                break;
            case 'payment_intent.created':
                console.log('Received payment_intent.created event');
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    response.json({received: true});
});

function updatePaymentStatus(paymentIntentId, status) {
    const sql = `UPDATE Sponsorships SET PaymentStatus = ? WHERE PaymentIntentID = ?`;
    db.run(sql, [status, paymentIntentId], function(err) {
        if (err) {
            console.error(`Database error during payment status update for PaymentIntent ID ${paymentIntentId}: ${err.message}`);
            return; // Add appropriate error handling here.
        }
        console.log(`Payment status updated to ${status} for PaymentIntent ID: ${paymentIntentId}`);
    });
}

function handleCheckoutSessionCompleted(session) {
    const { sponsorshipId, sponsorName, forWhom } = session.metadata;
    console.log(`Received checkout.session.completed with SponsorshipID: ${sponsorshipId}`);

    if (!sponsorshipId) {
        console.error('No sponsorshipId provided in session metadata');
        return; // More robust error handling can be added here
    }
    updateSponsorshipStatus(sponsorshipId, 'Paid', sponsorName, forWhom);
}

function updateSponsorshipStatus(sponsorshipId, status, sponsorName, sponsorContact) {
    console.log(`Attempting to update sponsorship: ${sponsorshipId} to ${status}`);
    const query = "UPDATE Sponsorships SET PaymentStatus = ?, IsSponsored = 1, SponsorName = ?, SponsorContact = ? WHERE SponsorshipID = ?";
    db.run(query, [status, sponsorName, sponsorContact, sponsorshipId], function(err) {
        if (err) {
            console.error(`Database update failed: ${err.message}`);
        } else {
            console.log(`Sponsorship ${sponsorshipId} updated to ${status} with sponsor info`);
        }
    });
}


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

// Logging middleware for debugging
app.use((req, res, next) => {
    console.log('Incoming Request:', req.method, req.path);
    console.log('Body:', req.body);
    next();
});


app.post('/api/create-checkout-session', async (req, res) => {
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
            metadata: {
                sponsorshipId: req.body.sponsorshipId // Ensure this is passed in the request body
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Failed to create checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session', details: error.message });
    }
});

app.get('/test-update', (req, res) => {
    updateSponsorshipStatus(1, 'Paid');
    res.send('Update attempted');
});

app.post('/test-checkout-session', (req, res) => {
    const { id, sponsorshipId, sponsorName, sponsorContact } = req.body;
    console.log(`Processing test session for sponsorship ID: ${sponsorshipId}`);
    updateSponsorshipStatus(sponsorshipId, 'Paid', sponsorName, sponsorContact);
    res.send('Test session processed');
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

// This route should handle updating the sponsorship status
app.patch('/api/sponsorships/:id', async (req, res) => {
    const { IsSponsored } = req.body;
    const sponsorshipId = req.params.id;

    try {
        const sql = "UPDATE Sponsorships SET IsSponsored = ? WHERE SponsorshipID = ?";
        db.run(sql, [IsSponsored ? 1 : 0, sponsorshipId], function(err) {
            if (err) {
                console.error('Error updating sponsorship status:', err.message);
                res.status(500).json({ error: err.message });
            } else if (this.changes > 0) {
                res.json({ message: "Sponsorship status updated successfully", data: this.changes });
            } else {
                res.status(404).json({ error: "No sponsorship found with that ID" });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
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




// Apply JSON parsing middleware globally but exclude the route used for Stripe webhooks.
app.use((req, res, next) => {
    if (req.originalUrl === '/api/stripe-webhook') {
        next();
    } else {
        express.json()(req, res, next);
    }
});



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

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
