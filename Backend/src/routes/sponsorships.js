const express = require('express');
const router = express.Router();
const db = require('../db/server.js'); 

// Route to get all mitzvot
router.get('/mitzvot', (req, res) => {
    const sql = "SELECT * FROM mitzvot";
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

module.exports = router;
// Path: Websites/Project_Zechus_Avos/Backend/src/routes/sponsorships.js