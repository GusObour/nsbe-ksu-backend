const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  name: String,
  image: String,
});

module.exports = mongoose.model('Sponsor', sponsorSchema);
