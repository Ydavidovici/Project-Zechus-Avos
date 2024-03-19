// sponsorships.js
const express = require('express');
const router = express.Router();
const db = require('../db/server.js');

// Route to get all mitzvot in ascending order by ID
router.get('/mitzvot', (req, res) => {
    const sql = "SELECT * FROM mitzvot WHERE sponsored = 0 ORDER BY id ASC"; // Add ORDER BY clause
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

router.post('/sponsor/:id', (req, res) => {
    const { id } = req.params;
    const sql = `UPDATE mitzvot SET sponsored = 1 WHERE id = ?`;

    db.run(sql, [id], (err) => {
        if (err) {
            res.status(500).json({"error": err.message});
            return;
        }
        res.json({
            "message": "Mitzvah sponsorship updated successfully",
            "mitzvahId": id
        });
    });
});

module.exports = router;
