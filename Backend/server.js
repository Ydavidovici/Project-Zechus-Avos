require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();


// Initialize express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json()); // Middleware to parse JSON bodies


// Connect to the SQLite database
const db = new sqlite3.Database('./mydatabase.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDb();
    }
});

function initializeDb() {
    db.run(`CREATE TABLE IF NOT EXISTS mitzvot (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        sponsored BOOLEAN NOT NULL DEFAULT 0
    )`, (err) => {
        if (err) {
            console.error('Error creating Mitzvot table', err.message);
            return;
        }
        console.log('Mitzvot table created or already exists.');
        db.run(`CREATE TABLE IF NOT EXISTS sponsor_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mitzvah_id INTEGER,
            sponsor_name TEXT NOT NULL,
            sponsored_for TEXT NOT NULL,
            FOREIGN KEY(mitzvah_id) REFERENCES mitzvot(id)
        )`, (err) => {
            if (err) {
                console.error('Error creating Sponsor Info table', err.message);
                return;
            }
            console.log('Sponsor Info table created or already exists.');
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
            for (let i = 1; i <= 42; i++) {
                const name = `Mitzvah ${i}`;
                const description = `Description for Mitzvah ${i}`;
                db.run(insert, [i, name, description, 0], err => {
                    if (err) {
                        console.error(`Error seeding Mitzvah ${i}:`, err.message);
                    }
                });
            }
        } else {
            console.log('Database already seeded');
        }
    });
}

app.get('/mitzvot', (req, res) => {
    db.all("SELECT * FROM mitzvot ORDER BY id", (err, rows) => {
        if (err) {
            res.status(500).send('Error querying mitzvot');
        } else {
            res.json(rows);
        }
    });
});

app.put('/mitzvot/:id', (req, res) => {
    const { name, description, sponsored } = req.body;
    const { id } = req.params;
    const sql = `UPDATE mitzvot SET name = ?, description = ?, sponsored = ? WHERE id = ?`;
    db.run(sql, [name, description, sponsored, id], function(err) {
        if (err) {
            res.status(500).send('Error updating mitzvah');
        } else {
            res.json({ rowsAffected: this.changes });
        }
    });
});

app.post('/sponsor_info', (req, res) => {
    const { mitzvah_id, sponsor_name, sponsored_for } = req.body;
    const sql = `INSERT INTO sponsor_info (mitzvah_id, sponsor_name, sponsored_for) VALUES (?, ?, ?)`;
    db.run(sql, [mitzvah_id, sponsor_name, sponsored_for], function(err) {
        if (err) {
            res.status(500).send('Error adding sponsor info');
        } else {
            res.json({ id: this.lastID });
        }
    });
});

app.get('/sponsor_info/:mitzvah_id', (req, res) => {
    const { mitzvah_id } = req.params;
    const sql = `SELECT * FROM sponsor_info WHERE mitzvah_id = ?`;
    db.all(sql, [mitzvah_id], (err, rows) => {
        if (err) {
            res.status(500).send('Error querying sponsor info');
        } else {
            res.json(rows);
        }
    });
});

app.get('/api/admin', (req, res) => {
    const sql = `
        SELECT mitzvot.id, mitzvot.name, mitzvot.description, mitzvot.sponsored, sponsor_info.sponsor_name, sponsor_info.sponsored_for
        FROM mitzvot
        LEFT JOIN sponsor_info ON mitzvot.id = sponsor_info.mitzvah_id
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).send('Error querying admin data');
        } else {
            res.json(rows);
        }
    });
});

// Listen to the App Engine-specified port, or 3000 otherwise
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = db;
