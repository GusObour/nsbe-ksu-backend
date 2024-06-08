const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config();
const Event = require('../models/Event');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Error connecting to database', err);
    process.exit(1); // Exit process with failure
  }
};

const seedEvents = async () => {
  await connectDB();

  const events = [];

  for (let i = 0; i < 10; i++) {
    events.push({
      title: faker.company.catchPhrase(),
      description: faker.lorem.sentence(),
      date: faker.date.future().toISOString().split('T')[0],
      time: faker.date.future().toTimeString().split(' ')[0],
      location: faker.location.streetAddress(), // Use updated faker method
      rsvpCount: faker.number.int({ min: 0, max: 50 }), // Use updated faker method
      rsvps: [],
    });
  }

  try {
    await Event.insertMany(events);
    console.log('Events seeded successfully');
  } catch (err) {
    console.error('Error seeding events:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedEvents();
