const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config(); // Ensure your .env file is properly configured

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const username = 'admin1';
const password = 'admin1';

bcrypt.hash(password, 10, async (err, hash) => {
    if (err) {
        return console.error('Error hashing password:', err.message);
    }
    console.log('Password hash generated:', hash); // Log the hash for debugging

    try {
        const client = await pool.connect();
        const res = await client.query(
            `INSERT INTO Admins (username, password) VALUES ($1, $2) RETURNING *`,
            [username, hash]
        );
        console.log('Admin credentials added successfully:', res.rows[0]);
        client.release();
    } catch (err) {
        console.error('Error inserting admin credentials:', err.message);
    } finally {
        await pool.end();
    }
});
