const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  missionId: { type: String, required: true }, // 'misi-1', 'misi-2', 'misi-3'
  type: {
    type: String,
    required: true,
    enum: [
      'pg', // Pilihan Ganda
      'benar-salah', // Benar atau Salah
      'audio-isian', // <--- Diubah dari 'audio-menjodohkan'
      'uraian', // Uraian
      'gambar-isian', // Gambar + Isian Singkat
      'drag-and-drop', // Drag and Drop
      'isian-singkat', // Isian Singkat (Mission 2)
      'ceklis', // Ceklis
      'ya-tidak', // Ya/Tidak (single statement in Misi 2)
      'menjodohkan', // Untuk Misi 1
      'ya-tidak-multi', // Untuk multi-statement Ya/Tidak di Misi 3
      'benar-salah-multi' // Untuk multi-statement Benar/Salah di Misi 3
    ]
  },
  questionText: { type: String, required: true },
  options: { type: [String] }, // Untuk PG, Benar-Salah, Ceklis, Drag-and-Drop (items to drag), Menjodohkan (items on left side)
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, // Bisa berupa string, array of strings, atau object (untuk D&D, Menjodohkan, multi-statement types)
  score: { type: Number, required: true, default: 10 },
  audioUrl: { type: String }, // Untuk 'audio-isian', 'isian-singkat' di Misi 2
  imageUrl: { type: String }, // Untuk 'gambar-isian'
  targets: { type: [String] }, // Untuk 'drag-and-drop' (drop zones) DAN 'menjodohkan' (options in dropdown)
  statements: { type: [String] }, // Untuk 'ya-tidak-multi' dan 'benar-salah-multi'
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
