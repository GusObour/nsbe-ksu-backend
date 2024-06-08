const mongoose = require('mongoose');

const leadershipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  position: { type: String, required: true },
  image: { type: String },
});

module.exports = mongoose.model('Leadership', leadershipSchema);
