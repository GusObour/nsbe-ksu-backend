const mongoose = require('mongoose');
require('dotenv').config();
const Sponsor = require('../models/Sponsor');

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

const addSponsor = async () => {
  await connectDB();

  const sponsor = new Sponsor({
    name: 'Chevron Phillips Chemical',
    image: '/images/Sponsors/CPChem_Logo_NoTag_RGB.jpg',
  });

  try {
    await sponsor.save();
    console.log('Sponsor added successfully');
  } catch (err) {
    console.error('Error adding sponsor:', err);
  } finally {
    mongoose.connection.close();
  }
};

addSponsor();
