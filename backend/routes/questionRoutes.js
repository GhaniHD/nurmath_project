// server/routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Perhatikan bahwa module.exports sekarang adalah sebuah fungsi
// yang menerima cacheMiddleware sebagai argumen.
module.exports = (cacheMiddleware) => { // <-- Pastikan ini menerima cacheMiddleware
  // Get questions for a specific missionId
  router.get('/:missionId', cacheMiddleware('questions-by-mission'), async (req, res) => {
    try {
      const { missionId } = req.params;
      const questions = await Question.find({ missionId });
      if (!questions || questions.length === 0) {
        return res.status(404).json({ error: 'No questions found for this mission' });
      }
      res.json(questions);
    } catch (err) {
      console.error('Error fetching questions:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get a single question by ID (optional, for specific question retrieval)
  router.get('/question/:id', cacheMiddleware('question-by-id'), async (req, res) => {
    try {
      const question = await Question.findById(req.params.id);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      res.json(question);
    } catch (err) {
      console.error('Error fetching single question:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};