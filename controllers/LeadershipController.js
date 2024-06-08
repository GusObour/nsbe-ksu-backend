const Leadership = require('../models/Leadership');
const User = require('../models/User');

class LeadershipController {
  async getAll(req, res) {
    const leadership = await Leadership.find().populate('user', 'username');
    res.json(leadership);
  }

  async create(req, res) {
    const { userId, position, image } = req.body;
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      user.isLeader = true;
      await user.save();

      const leader = new Leadership({ user: userId, position, image });
      await leader.save();
      res.json(leader);
    } catch (err) {
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
}

module.exports = new LeadershipController();
