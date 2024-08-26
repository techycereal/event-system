const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(__dirname, 'token.json');

// OAuth2 client setup
const oauth2Client = new google.auth.OAuth2(
  process.env.OAUTH_CLIENT_1,
  process.env.OAUTH_CLIENT_2,
  `${process.env.BASE_URL}/api/google/oauth2callback`
);

function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
}

async function getAccessToken(code) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  return tokens;
}

async function getPrimaryCalendarId() {
    try {
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const response = await calendar.calendarList.list();
      const calendars = response.data.items;
      const primaryCalendar = calendars.find(cal => cal.primary);
  
      if (primaryCalendar) {
        return primaryCalendar.id;
      } else {
        throw new Error('Primary calendar not found.');
      }
    } catch (error) {
      console.error('Error retrieving calendar list:', error.message);
      throw error;
    }
}

async function createEvent(eventDetails) {
    try {
        const calendarId = await getPrimaryCalendarId(); // Get the primary calendar ID
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = await calendar.events.insert({
            calendarId: calendarId,
            resource: {
                ...eventDetails,
                visibility: 'public'
            },
        });

        console.log('Event created:', event.data);

        // Generate invite link
        const inviteLink = generateInviteLink(event.data);
        
        const body = {
            event: event.data,
            calendarId: calendarId,
            inviteLink: inviteLink
        };
        return body;
    } catch (error) {
        console.error('Error creating event:', error.message);
        throw error;
    }
}

function generateInviteLink(event) {
    const { summary, start, end, description, location } = event;
    
    const startDate = new Date(start.dateTime || start.date).toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
    const endDate = new Date(end.dateTime || end.date).toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
    
    const url = `https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(summary)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location || '')}`;
    
    return url;
}

async function joinEvent(eventId, calendarId, attendeeEmail) {
    try {
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const event = await calendar.events.get({ calendarId: calendarId, eventId: eventId });

        // Add the new attendee to the event
        const attendees = event.data.attendees || [];
        attendees.push({ email: attendeeEmail });

        // Update the event with the new attendee list
        const updatedEvent = await calendar.events.patch({
            calendarId: calendarId,
            eventId: eventId,
            resource: {
                ...event.data,
                attendees: attendees
            }
        });

        console.log('Event updated with new attendee:', updatedEvent.data);
        return updatedEvent.data;
    } catch (error) {
        console.error('Error updating event:', error.message);
        throw error;
    }
}

module.exports = { getAuthUrl, getAccessToken, createEvent, joinEvent };
