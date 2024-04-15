require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); 
const sqlite3 = require('sqlite3').verbose();

// Initialize express app
const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..','..','Frontend')));

const fs = require('fs');

function initializeDb() {
    console.log('Initializing database with schema and seed data');
    const schemaPath = path.join(__dirname, 'schema.sql');
    fs.readFile(schemaPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading schema.sql:', err.message);
            return;
        }
        db.exec(data, (execErr) => {
            if (execErr) {
                console.error('Error executing schema:', execErr.message);
            } else {
                console.log('Database schema and seed data executed successfully');
            }
        });
    });
}

// Connect to the SQLite database and initialize it
const db = new sqlite3.Database('backend/db/mydatabase.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDb(); 
    }
});




app.get('/api/mitzvos', (_req, res) => {
    db.all("SELECT * FROM mitzvos ORDER BY id", (err, rows) => {
        if (err) {
            console.error('Error querying mitzvos:', err.message);
            return res.status(500).send('Error querying mitzvos');
        }
        res.json({data: rows}); // Ensure consistent response structure
    });
});

app.put('/api/mitzvos/:id', (req, res) => {
    const { name, description, sponsored } = req.body;
    const { id } = req.params;
    const sql = "UPDATE mitzvos SET name = ?, description = ?, sponsored = ? WHERE id = ?";
    db.run(sql, [name, description, sponsored, id], function(err) {
        if (err) {
            console.error('Error updating mitzvah:', err.message);
            return res.status(500).send('Error updating mitzvah');
        }
        res.json({ rowsAffected: this.changes });
    });
});

app.post('/api/sponsor_info', (req, res) => {
    const { mitzvah_id, sponsor_name, sponsored_for } = req.body;
    const sql = "INSERT INTO sponsor_info (mitzvah_id, sponsor_name, sponsored_for) VALUES (?, ?, ?)";
    db.run(sql, [mitzvah_id, sponsor_name, sponsored_for], function(err) {
        if (err) {
            console.error('Error adding sponsor info:', err.message);
            return res.status(500).send('Error adding sponsor info');
        }
        res.json({ id: this.lastID });
    });
});

app.get('/api/sponsor_info/:mitzvah_id', (req, res) => {
    const { mitzvah_id } = req.params;
    const sql = "SELECT * FROM sponsor_info WHERE mitzvah_id = ?";
    db.all(sql, [mitzvah_id], (err, rows) => {
        if (err) {
            console.error('Error querying sponsor info:', err.message);
            return res.status(500).send('Error querying sponsor info');
        }
        res.json(rows);
    });
});

app.get('/api/admin', (_req, res) => {
    const sql = `
        SELECT mitzvos.id, mitzvos.name, mitzvos.description, mitzvos.sponsored, sponsor_info.sponsor_name, sponsor_info.sponsored_for
        FROM mitzvos
        LEFT JOIN sponsor_info ON mitzvos.id = sponsor_info.mitzvah_id
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error querying admin data:', err.message);
            return res.status(500).send('Error querying admin data');
        }
        res.json(rows);
    });
});

// Simplified /sponsor route for demonstration, ensure alignment with actual data structure and requirements
app.post('/api/sponsor', (req, res) => {
    // Server-side validation of request body is highly recommended here
    const { sponsorshipName, name, email, sponsoredFor } = req.body;
    // Insert logic here to handle the sponsorship (e.g., database insertion, payment processing)

    // Example response
    res.json({ success: true, message: "Sponsorship processed" });
});

app.get('*', (req, res) => {
    // Send the main entry point of your frontend app for any non-API requests
    res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'html', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
