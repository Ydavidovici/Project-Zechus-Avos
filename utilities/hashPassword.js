const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const dbPath = '../db/pza.db'; // Adjust the path as necessary

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.error('Error opening database:', err.message);
    }
    console.log('Connected to the database.');
});

const username = 'admin1';
const password = 'admin1'; // Changed to a more secure password for example

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        return console.error('Error hashing password:', err.message);
    }
    console.log('Password hash generated:', hash); // Log the hash for debugging

    db.run(`INSERT INTO Admins (username, password) VALUES (?, ?)`, [username, hash], function(err) {
        if (err) {
            return console.error("Error inserting admin credentials:", err.message);
        }
        console.log("Admin credentials added successfully. Rows affected:", this.changes);
    });
});
