require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); 
const sqlite3 = require('sqlite3').verbose();

// Initialize express app
const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'Frontend')));

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
    console.log('Initializing database');
    db.run(`CREATE TABLE IF NOT EXISTS mitzvos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        sponsored BOOLEAN NOT NULL DEFAULT 0,
        parasha TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error creating table', err.message);
            return;
        }
        console.log('mitzvos table created or already exists.');

        db.run(`CREATE TABLE IF NOT EXISTS sponsor_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mitzvah_id INTEGER,
            sponsor_name TEXT NOT NULL,
            sponsored_for TEXT NOT NULL,
            FOREIGN KEY(mitzvah_id) REFERENCES mitzvos(id)
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
    const mitzvos = [
        { id: 1, name: 'פריה ורביה', parasha: 'בראשית', description: '' },
        { id: 2, name: 'מילה', parasha: 'לך לך', description: '' },
        { id: 3, name: 'גיד הנשה', parasha: 'וישלח', description: '' },
        { id: 4, name: 'קידוש החודש', parasha: 'בא', description: '' },
        { id: 5, name: 'הקרבת קרבן פסח', parasha: 'בא', description: '' },
        { id: 6, name: 'אכילת הפסח', parasha: 'בא', description: '' },
        { id: 7, name: 'לא תעשה נא ומבושל', parasha: 'בא', description: '' },
        { id: 8, name: 'שלא להוסיר מהפסח', parasha: 'בא', description: '' },
        { id: 9, name: 'עשה השבתת חמץ', parasha: 'בא', description: '' },
        { id: 10, name: 'אכילת מצה', parasha: 'בא', description: '' },
        { id: 11, name: 'שלא ימצא חמץ ברשותנו בפסח', parasha: 'בא', description: '' },
        { id: 12, name: 'תערובות חמץ', parasha: 'בא', description: '' },
        { id: 13, name: 'שלא להאכיל מן הפסח ישראל מומר', parasha: 'בא', description: '' },
        { id: 14, name: 'שלא להאכיל מן הפסח לגר ותושב', parasha: 'בא', description: '' },
        { id: 15, name: 'שלא להוציא מבשר הפסח', parasha: 'בא', description: '' },
        { id: 16, name: 'שלא לשבר עצם מן הפסח', parasha: 'בא', description: '' },
        { id: 17, name: 'שלא יאכל ערל מן הפסח', parasha: 'בא', description: '' },
        { id: 18, name: 'קידוש בכורות בערב יום טוב', parasha: 'בא', description: '' },
        { id: 19, name: 'שלא יאכל חמץ בפסח', parasha: 'בא', description: '' },
        { id: 20, name: 'שלא יראה חמץ בפסח', parasha: 'בא', description: '' },
        { id: 21, name: 'סיפור יציאת מצרים', parasha: 'בא', description: '' },
        { id: 22, name: 'פדיון פטר חמור', parasha: 'בא', description: '' },
        { id: 23, name: 'עריפת פטר חמור', parasha: 'בא', description: '' },
        { id: 24, name: 'שלא לילך חוץ מתחום שבת', parasha: 'בשלח', description: '' },
        { id: 25, name: 'האמונה במציאות ה', parasha: 'יתרו', description: '' },
        { id: 26, name: 'שלא להאמין באלוה זולתו', parasha: 'יתרו', description: '' },
        { id: 27, name: 'שלא לעשות פסל ומציבה', parasha: 'יתרו', description: '' },
        { id: 28, name: 'שלא להשתחוה לפסל ומציבה', parasha: 'יתרו', description: '' },
        { id: 29, name: 'שלא לעשות מעשה עבודה זרה', parasha: 'יתרו', description: '' },
        { id: 30, name: 'שלא להשתחוה לעבודה זרה', parasha: 'יתרו', description: '' },
        { id: 31, name: 'שלא להשתחוה לשמש ולירח', parasha: 'יתרו', description: '' },
        { id: 32, name: 'שלא להשתחוה לכוכבים', parasha: 'יתרו', description: '' },
        { id: 33, name: 'שלא להשתחוה לכל צורה', parasha: 'יתרו', description: '' },
        { id: 34, name: 'שלא להשתחוה לצורת אדם', parasha: 'יתרו', description: '' },
        { id: 35, name: 'שלא להשתחוה לצורת בהמה', parasha: 'יתרו', description: '' },
        { id: 36, name: 'שלא להשתחוה לצורת עוף', parasha: 'יתרו', description: '' },
        { id: 37, name: 'שלא להשתחוה לצורת רמש', parasha: 'יתרו', description: '' },
        { id: 38, name: 'שלא להשתחוה לצורת דג', parasha: 'יתרו', description: '' },
        { id: 39, name: 'שלא לעשות צורת אדם', parasha: 'יתרו', description: '' },
        { id: 40, name: 'שלא לבנות אבני מזבח גזית', parasha: 'יתרו', description: '' },
        { id: 41, name: 'שלא לפסוע על המזבח', parasha: 'יתרו', description: '' },
        { id: 42, name: 'שלא לעלות במעלות על המזבח', parasha: 'יתרו', description: '' },
    ];

    db.get("SELECT COUNT(*) AS count FROM mitzvos", (err, row) => {
        if (err) {
            console.error('Error checking mitzvos count', err.message);
            return;
        }
        if (row.count === 0) {
            const insert = 'INSERT INTO mitzvos (id, name, parasha, description) VALUES (?, ?, ?, ?)';
            mitzvos.forEach((mitzvah) => {
                db.run(insert, [mitzvah.id, mitzvah.name, mitzvah.parasha, mitzvah.description], err => {
                    if (err) {
                        console.error(`Error seeding Mitzvah ${mitzvah.id}:`, err.message);
                    }
                });
            });
        } else {
            console.log('Database already seeded');
        }
    });
}


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
    res.sendFile(path.join(__dirname, '..', 'frontend', 'html', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
