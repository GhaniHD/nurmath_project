// server/models/Question.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  missionId: { type: String, required: true }, // 'misi-1', 'misi-2', 'misi-3'
  type: {
    type: String,
    required: true,
    enum: [
      'pg', // Pilihan Ganda
      'benar-salah', // Benar atau Salah
      'audio-menjodohkan', // Audio Menjodohkan
      'uraian', // Uraian
      'gambar-isian', // Gambar + Isian Singkat
      'drag-and-drop', // Drag and Drop
      'isian-singkat', // Isian Singkat (Mission 2)
      'ceklis', // Ceklis
      'ya-tidak', // Ya/Tidak (single statement in Misi 2)
      'menjodohkan', // For Misi 1
      'ya-tidak-multi', // For multi-statement Ya/Tidak in Misi 3
      'benar-salah-multi' // For multi-statement Benar/Salah in Misi 3
    ]
  },
  questionText: { type: String, required: true },
  options: { type: [String] }, // For PG, Benar-Salah, Audio-Menjodohkan, Ceklis, Drag-and-Drop (items to drag), Menjodohkan (items on left side)
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be string, array of strings, or object (for D&D, Menjodohkan, multi-statement types)
  score: { type: Number, required: true, default: 10 },
  audioUrl: { type: String }, // For 'audio-menjodohkan', 'isian-singkat' in Misi 2
  imageUrl: { type: String }, // For 'gambar-isian'
  targets: { type: [String] }, // For 'drag-and-drop' (drop zones) AND 'menjodohkan' (options in dropdown)
  statements: { type: [String] }, // For 'ya-tidak-multi' and 'benar-salah-multi'
  // No need for 'matchingPairs' in schema if 'options' and 'targets' are used properly for 'menjodohkan'
  // and correctAnswer maps them directly.
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);