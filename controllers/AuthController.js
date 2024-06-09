const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const validator = require('validator');
const User = require('../models/User');
const { AvatarGenerator } = require('random-avatar-generator');
const SMSService = require('../services/smsService');

class AuthController {
  async register(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, username, password, isLeader, phoneNumber, agreeToSMS } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!validator.isStrongPassword(password, { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character'
      });
    }

    if (!validator.isMobilePhone(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    if (isLeader !== undefined && typeof isLeader !== 'boolean') {
      return res.status(400).json({ message: 'isLeader must be a boolean' });
    }

    if (agreeToSMS !== undefined && typeof agreeToSMS !== 'boolean') {
      return res.status(400).json({ message: 'agreeToSMS must be a boolean' });
    }

    const generator = new AvatarGenerator();
    const avatarUrl = generator.generateRandomAvatar();

    try {
      const existingUser = await User.findOne({
        $or: [
          { username },
          { email }
        ]
      });

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        isLeader,
        phoneNumber,
        headShot: avatarUrl,
        agreeToSMS
      });

      await user.save();

      const sms = new SMSService();
      const message = `Welcome to the team, ${firstName}! Your username is ${username}`;
      await sms.sendSMS(phoneNumber, message);

      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }


  async login(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id, isLeader: user.isLeader },
        process.env.SESSION_SECRET,
        { expiresIn: '1h' }
      );

      return res.json({
        token,
        user: {
          username: user.username,
          isLeader: user.isLeader,
          phoneNumber: user.phoneNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          headShot: user.headShot,
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async updateProfile(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, username, phoneNumber } = req.body;
    const userId = req.user._id;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!validator.isMobilePhone(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.username = username;
      user.phoneNumber = phoneNumber;

      await user.save();
      return res.json(user);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async changePassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      return res.json({ message: 'Password changed successfully' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to log out' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  }

  async getSession(req, res) {
    res.json(req.session);
  }
}

module.exports = new AuthController();
