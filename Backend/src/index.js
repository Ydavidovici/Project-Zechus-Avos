// index.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();

// Import the database initialization script
require('./db/server.js');

// Import routes
const sponsorshipsRoutes = require('./routes/sponsorships.js');

app.use(cors());
app.use(express.json());
app.use('/api', sponsorshipsRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
