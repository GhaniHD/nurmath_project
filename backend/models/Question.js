const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  missionId: { type: String, required: true }, // e.g., "misi-1"
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  score: { type: Number, required: true },
});

module.exports = mongoose.model('Question', questionSchema);