const express = require('express');
const { getEventsMongo } = require('./database/mongo')

const router = express.Router();

// Route to generate Google Auth URL
router.get('/all-events', async (req, res) => {
  const query = await getEventsMongo()
  res.send(query)
});

module.exports = router;
