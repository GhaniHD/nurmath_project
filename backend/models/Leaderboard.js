const mongoose = require('mongoose');

// Skema Leaderboard ini akan menyimpan setiap submission skor individu.
// Agregasi untuk total skor akan dilakukan di route GET.
const leaderboardSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  score: { type: Number, required: true, min: 0 }, // Score untuk submission ini
  missionId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
