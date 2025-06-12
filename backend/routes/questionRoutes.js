const express = require('express');
const router = express.Router();
// Ubah baris ini:
// const { Question } = require('../models/Question');
const Question = require('../models/Question'); // <--- Hapus kurung kurawal
const { cacheMiddleware } = require('../server');

router.get('/:missionId', cacheMiddleware('questions'), async (req, res) => {
  try {
    const { missionId } = req.params;
    const questions = await Question.find({ missionId }).lean();
    if (!questions.length) {
      return res.status(404).json({ error: 'Tidak ada pertanyaan ditemukan untuk misi ini.' });
    }
    res.json(questions);
  } catch (err) {
    console.error('Error fetching questions for missionId', req.params.missionId, ':', err.stack);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;