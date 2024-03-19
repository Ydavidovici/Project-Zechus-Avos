const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize express app
const app = express();
app.use(bodyParser.json()); // Middleware to parse JSON bodies

// Define the path to the database
const dbPath = path.resolve(__dirname, '../db/mydatabase.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDb();
    }
});

function initializeDb() {
    db.serialize(() => {
        db.run("DELETE FROM mitzvot", [], (err) => {
            if (err) {
                console.error('Error clearing mitzvot table', err.message);
            } else {
                console.log('Mitzvot table cleared.');
                seedDatabase();
            }
        });        
        db.run(`CREATE TABLE IF NOT EXISTS mitzvot (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL,
            sponsored BOOLEAN NOT NULL DEFAULT 0
        )`, [], (err) => {
            if (err) {
                console.error('Error creating Mitzvot table', err.message);
                return;
            }
            console.log('Mitzvot table created or already exists.');
            seedDatabase();
        });
    });
}

function seedDatabase() {
    db.get("SELECT COUNT(*) AS count FROM mitzvot", (err, row) => {
        if (err) {
            console.error('Error checking mitzvot count', err.message);
            return;
        }
        if (row.count === 0) {
            const insert = 'INSERT INTO mitzvot (id, name, description, sponsored) VALUES (?, ?, ?, ?)';
            // Seed each mitzvah with specific id, name, and description
            for (let i = 1; i <= 42; i++) {
                // Here we construct the name and description using the loop counter
                const name = `Mitzvah ${i}`;
                const description = `Description for Mitzvah ${i}`;
                db.run(insert, [i, name, description, 0], err => {
                    if (err) {
                        console.error(`Error seeding Mitzvah ${i}:`, err.message);
                    } else {
                        console.log(`Mitzvah ${i} seeded successfully.`);
                    }
                });
            }
        } else {
            console.log('Database already seeded');
        }
        // After the seeding loop in seedDatabase()
db.all("SELECT * FROM mitzvot ORDER BY id", (err, rows) => {
    if (err) {
        console.error('Error querying seeded mitzvot', err.message);
    } else {
        console.log('Final state of seeded mitzvot:', rows);
    }
});

    });
}

// Your initializeDb and seedDatabase functions remain unchanged

// Endpoint to create a payment intent
app.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount } = req.body; // Ensure the client sends the amount
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            // Additional parameters can be set here
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error("Error creating payment intent:", err.message);
        res.status(500).send({ error: err.message });
    }
});

// Listen to the App Engine-specified port, or 3000 otherwise
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = db;
