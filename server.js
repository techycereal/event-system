const express = require('express');
const bodyParser = require('body-parser');
const googleRoutes = require('./googleRoutes'); // Path to your googleRoutes.js file
const databaseRoutes = require('./databaseRoutes')
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors())
// Middleware
app.use(bodyParser.json()); // Parse incoming JSON requests

// Routes
app.use('/api/google', googleRoutes); // All Google-related routes
app.use('/api/database', databaseRoutes); // All Google-related routes

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
