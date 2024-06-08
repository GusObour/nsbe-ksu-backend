const Sponsor = require('../models/Sponsor');

class SponsorController {
  async getAll(req, res) {
    try {
      const sponsors = await Sponsor.find();
      res.json(sponsors);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async create(req, res) {
    try {
      const sponsor = new Sponsor(req.body);
      await sponsor.save();
      res.json(sponsor);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async update(req, res) {
    try {
      const sponsor = await Sponsor.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(sponsor);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  async delete(req, res) {
    try {
      await Sponsor.findByIdAndDelete(req.params.id);
      res.json({ message: 'Sponsor deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new SponsorController();
