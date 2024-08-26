const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGO_DB;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connect(db_name) {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    return await client.db(db_name)
  } catch(err) {
    console.log(err)
  }
}

async function createEventMongo(event, calendarId, inviteLink, imageUrl){
    try {   
        const database = await connect('events');
        console.log(event)
        // Insert the post with the current timestamp
        await database.collection('events').insertOne({
            calendarId: calendarId,
            start: event.start,
            end: event.end,
            summary: event.summary,
            description: event.description,
            eventId: event.id,
            inviteLink, inviteLink,
            imageUrl: imageUrl
        });
    
        return 'success'
      } catch (err) {
        console.log(err);
        return NextResponse.json({ error: 'An error occurred while creating the post.' }, { status: 500 });
      }
}

async function getEventsMongo(){
    try {   
        const database = await connect('events');
    
        // Insert the post with the current timestamp
        const query = await database.collection('events').find().toArray()
    
        return query
      } catch (err) {
        console.log(err);
        return NextResponse.json({ error: 'An error occurred while creating the post.' }, { status: 500 });
      }
}

module.exports = { createEventMongo, getEventsMongo }