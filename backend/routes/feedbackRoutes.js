const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const FeedbackModel = require('../models/Feedback'); // Import model Feedback

// Module exports a function that accepts dbClient
module.exports = (dbClient) => {
  // Buat instance dari FeedbackModel dengan dbClient
  const feedbackModel = new FeedbackModel(dbClient);

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
      const newFeedback = await feedbackModel.createFeedback(userName, feedback); // Panggil method dari model

      res.status(200).json({ message: 'Feedback submitted successfully', feedback: newFeedback });
    } catch (err) {
      console.error('Error submitting feedback in route:', err.message); // Log error dari model
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};