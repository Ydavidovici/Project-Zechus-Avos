const sqlite3 = require('sqlite3').verbose();

// Create a new database file or open an existing one
const db = new sqlite3.Database('./db/mydatabase.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Database connected');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS mitzvot (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL
    )`, [], function(err) {
        if (err) {
            console.error('Error creating table', err);
            return;
        }

        // Insert initial data
        const insert = 'INSERT INTO mitzvot (name, description) VALUES (?, ?)';
        db.run(insert, ["Study Torah", "Dedicate time daily to study Torah."]);
        db.run(insert, ["Pray", "Engage in daily prayer to connect with the Divine."]);
        db.run(insert, ["Give Charity", "Give generously to those in need."]);

        console.log('Initial mitzvot have been seeded');
    });
});

// Export the db object for use in other files
module.exports = db;
