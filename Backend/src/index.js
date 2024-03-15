const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const PORT = process.env.PORT || 3000;

// Correctly requiring the sponsorships routes
const sponsorshipsRoutes = require('./routes/sponsorships.js');

app.use(express.json());
app.use('/api', sponsorshipsRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
