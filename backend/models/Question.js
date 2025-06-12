const mongoose = require('mongoose');

    const questionSchema = new mongoose.Schema({
      type: { type: String, required: true },
      questionText: { type: String, required: true },
      options: [String],
      correctAnswer: { type: String, required: true },
      score: { type: Number, required: true },
      missionId: { type: String, required: true },
      audioUrl: String,
      imageUrl: String,
      targets: [String]
    });

    module.exports = mongoose.model('Question', questionSchema);