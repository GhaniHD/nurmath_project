const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  score: { type: Number, required: true, min: 0 },
  missionId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);