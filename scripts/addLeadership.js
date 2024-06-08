const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');
const Leadership = require('../models/Leadership');

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

const addLeadership = async () => {
  await connectDB();

  const password = '123456'; // Replace with a secure password

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username: 'obi',
    password: hashedPassword,
    isLeader: true,
  });

  try {
    const savedUser = await user.save();

    const leadership = new Leadership({
      user: savedUser._id,
      position: 'President',
      image: '../../nsbe-ksu-frontend/public/images/leadership/obi.jpg',
    });

    await leadership.save();

    console.log('Leadership added successfully');
  } catch (err) {
    console.error('Error adding leadership:', err);
  } finally {
    mongoose.connection.close();
  }
};

addLeadership();
