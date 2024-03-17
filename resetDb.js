const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Adjust the path to your database file as necessary
const dbPath = path.join(__dirname, 'db/mydatabase.db');

// Open the database
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the database.');
});

// Wipe the mitzvot table
db.serialize(() => {
    db.run('DELETE FROM mitzvot', [], function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Rows deleted ${this.changes}`);
    });
});

// Close the database connection
db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Closed the database connection.');
});
