const Agenda = require('agenda');
const Event = require('../models/Event');
const User = require('../models/User');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

const agenda = new Agenda({ db: { address: process.env.MONGO_URI, collection: 'agendaJobs' } });

// Define the job to send reminders
agenda.define('send event reminder', async (job) => {
  const { eventId, type } = job.attrs.data;
  const event = await Event.findById(eventId).populate('rsvps', 'phoneNumber username');
  
  if (event) {
    const message = type === 'day'
      ? `Reminder: You have an event tomorrow: ${event.title} at ${event.time}.`
      : `Reminder: You have an event in one hour: ${event.title} at ${event.time}.`;

    for (const user of event.rsvps) {
      if (user.phoneNumber) {
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: user.phoneNumber,
        });
      }
    }
  }
});

// Schedule jobs for all events
const scheduleEventReminders = async () => {
  const events = await Event.find();

  for (const event of events) {
    const eventDate = new Date(event.date);
    const eventTime = event.time.split(':');
    eventDate.setHours(eventTime[0]);
    eventDate.setMinutes(eventTime[1]);

    const oneDayBefore = new Date(eventDate);
    oneDayBefore.setDate(eventDate.getDate() - 1);
    
    const oneHourBefore = new Date(eventDate);
    oneHourBefore.setHours(eventDate.getHours() - 1);

    // Schedule job one day before the event
    agenda.schedule(oneDayBefore, 'send event reminder', { eventId: event._id, type: 'day' });

    // Schedule job one hour before the event
    agenda.schedule(oneHourBefore, 'send event reminder', { eventId: event._id, type: 'hour' });
  }
};

agenda.on('ready', async () => {
  await scheduleEventReminders();
  agenda.start();
});

module.exports = agenda;
