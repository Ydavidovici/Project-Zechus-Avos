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
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL
    )`, [], function(err) {
        if (err) {
            console.error('Error creating table', err);
            return;
        }
        console.log('Mitzvot table created or already exists.');
        
        // Check if the table is already populated
        db.get("SELECT COUNT(*) AS count FROM mitzvot", (err, row) => {
            if (err) {
                console.error('Error checking mitzvot count', err);
                return;
            }
            if (row.count == 0) {
                // If not, seed the database
                seedDatabase();
            } else {
                console.log('Database already seeded');
            }
        });
    });
});

function seedDatabase() {
    const mitzvot = [
        { name: "Study Torah", description: "Dedicate time daily to study Torah." },
        { name: "Pray", description: "Engage in daily prayer to connect with the Divine." },
        { name: "Give Charity", description: "Give generously to those in need." },
        // Include all 42 mitzvot here
    ];
    const insert = 'INSERT OR IGNORE INTO mitzvot (name, description) VALUES (?, ?)';
    mitzvot.forEach(mitzvah => {
        db.run(insert, [mitzvah.name, mitzvah.description], (err) => {
            if (err) {
                console.error('Error inserting mitzvah', err);
            }
        });
    });
    console.log('Initial mitzvot have been seeded');
}

// Export the db object for use in other files
module.exports = db;
