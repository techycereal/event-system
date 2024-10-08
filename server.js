const express = require('express');
const cors = require('cors');
require('dotenv').config();

const googleRoutes = require('./googleRoutes'); // Path to your googleRoutes.js file
const databaseRoutes = require('./databaseRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Parse incoming JSON requests

// Routes
app.use('/api/google', googleRoutes); // All Google-related routes
app.use('/api/database', databaseRoutes); // All database-related routes

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
