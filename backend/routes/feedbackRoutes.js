const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Module exports a function that accepts dbClient
module.exports = (dbClient) => {
  router.post('/', [
    body('userName').trim().notEmpty().withMessage('User name is required'),
    body('feedback').trim().notEmpty().withMessage('Feedback is required')
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { userName, feedback } = req.body;
      const { rows } = await dbClient.query(
        `
        INSERT INTO feedback (user_id, feedback_text, created_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        RETURNING *
        `,
        [userName, feedback]
      );

      res.status(200).json({ message: 'Feedback submitted', feedback: rows[0] });
    } catch (err) {
      console.error('Error submitting feedback:', err.stack);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};