const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  score: { type: Number, required: true },
  missionId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);