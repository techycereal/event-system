const express = require('express');
const multer = require('multer');
const path = require('path');
const { getAuthUrl, getAccessToken, createEvent, joinEvent } = require('./googleAuth');
const { createEventMongo } = require('./database/mongo');
const { uploadFileToBlob } = require('./azureBlobStorage');
const fs = require('fs');
const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Temporary folder for multer to save files

// Route to generate Google Auth URL
router.get('/google-auth', (req, res) => {
  const authUrl = getAuthUrl();
  res.json({ url: authUrl });
});

// Route to handle OAuth2 callback
router.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  try {
    const tokens = await getAccessToken(code);
    // Redirect to the front-end with tokens
    res.redirect(`http://localhost:5173/auth-success?token=${tokens.access_token}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to create a Google Calendar event
router.post('/create-event', upload.single('image'), async (req, res) => {
  const eventDetails = JSON.parse(req.body.event); // Parse the JSON string from body
  const image = req.file; // Get the uploaded file
  try {
    // Upload the image to Azure Blob Storage
    let imageUrl = null;
    if (image) {
        imageUrl = await uploadFileToBlob(image.path, image.originalname);
        console.log(imageUrl)
        const event = await createEvent(eventDetails);
        console.log(event)
        await createEventMongo(event.event, event.calendarId, event.inviteLink, imageUrl);

        res.json(event.data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    // Clean up the temporary file
    if (image) {
      fs.unlinkSync(image.path);
    }
  }
});

// Route to join an event
router.post('/join-event', async (req, res) => {
    const { eventId, id, attendeeEmail } = req.body;
    try {
      const response = await joinEvent(id, eventId, attendeeEmail);
      console.log('Successfully joined event:', response);
      res.json(response);
    } catch (error) {
      console.error('Error joining event:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
