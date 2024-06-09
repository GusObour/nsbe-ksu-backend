const Leadership = require('../models/Leadership');
const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const SMSService = require('../services/smsService');
const validator = require('validator');
const { AvatarGenerator } = require('random-avatar-generator');

class LeadershipController {
  async getAll(req, res) {
    const leadership = await Leadership.find().populate('user', 'username email phoneNumber firstName lastName');
    res.json(leadership);
  }

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, phoneNumber, position, image} = req.body;
    const username = firstName.toLowerCase() + lastName;

    const password = this.generateLeadershipPassword();

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (!validator.isMobilePhone(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }

    const generator = new AvatarGenerator();
    const avatarUrl = image || generator.generateRandomAvatar();

    try {
      let user = await User.findOne({
        $or: [{ username: username }, { email: email }]
      });

      if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
          firstName,
          lastName,
          email,
          username,
          password: hashedPassword,
          phoneNumber,
          isLeader: true,
          headShot: avatarUrl
        });
      } else {
        user.isLeader = true;
      }

      await user.save();

      const leader = new Leadership({ user: user._id, position, image: avatarUrl });
      await leader.save();

      const message = `Hello ${user.firstName}, you have been added as a leader on our platform. Your username is ${user.username} and your password is ${password}. Please login to your account to change your password.`;
      const sms = new SMSService();
      await sms.sendMessage(phoneNumber, message);

      res.json(leader);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async update(req, res) {
    const { userId, position, image } = req.body;
    try {
      const leader = await Leadership.findByIdAndUpdate(req.params.id, { user: userId, position, image }, { new: true });
      res.json(leader);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async delete(req, res) {
    try {
      const leader = await Leadership.findById(req.params.id);
      if (!leader) {
        return res.status(404).json({ message: 'Leader not found' });
      }
      const user = await User.findById(leader.user);
      if (user) {
        user.isLeader = false;
        await user.save();
      }
      await leader.remove();
      res.json({ message: 'Leadership member deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  generateLeadershipPassword() {
    const length = crypto.randomInt(8, 12);
    return crypto.randomBytes(length).toString('base64').slice(0, length);
  }
}

module.exports = new LeadershipController();
