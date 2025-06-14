const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || auth !== 'Basic YWRtaW46cGFzc3dvcmQxMjM=') { // admin:password123 base64
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Module exports a function that accepts dbClient
module.exports = (dbClient) => {
  // Get all questions
  router.get('/questions', adminAuth, async (req, res) => {
    try {
      const { rows } = await dbClient.query('SELECT * FROM questions');
      res.json(rows);
    } catch (err) {
      console.error('Error fetching questions:', err.stack);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create a new question
  router.post('/questions', adminAuth, [
    body('type').trim().notEmpty().withMessage('Question type is required'),
    body('questionText').trim().notEmpty().withMessage('Question text is required'),
    body('correctAnswer').notEmpty().withMessage('Correct answer is required'), // Removed trim() as correctAnswer may be an object
    body('score').isInt({ min: 0 }).withMessage('Score must be a non-negative integer')
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, questionText, options, correctAnswer, score, missionId, audioUrl, imageUrl, targets } = req.body;
      const { rows } = await dbClient.query(
        `
        INSERT INTO questions (type, question_text, options, correct_answer, score, mission_id, audio_url, image_url, targets)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
        `,
        [
          type,
          questionText,
          options ? JSON.stringify(options) : null,
          JSON.stringify(correctAnswer),
          score,
          missionId || null,
          audioUrl || null,
          imageUrl || null,
          targets ? JSON.stringify(targets) : null
        ]
      );

      // Invalidate cache
      req.app.get('cache').del('questions');
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error('Error creating question:', err.stack);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};