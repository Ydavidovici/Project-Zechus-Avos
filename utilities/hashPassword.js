const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../backend/db/pza.db');

const username = 'admin1';
const password = 'admin1';  // Change this to the actual password

bcrypt.hash(password, 10, function(err, hash) {
    db.run(`INSERT INTO Admins (username, password) VALUES (?, ?)`, [username, hash], function(err) {
        if (err) {
            return console.log("Error inserting admin credentials", err.message);
        }
        console.log("Admin credentials added successfully");
    });
});
