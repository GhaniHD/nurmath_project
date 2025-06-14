const express = require('express');
const router = express.Router();
const QuestionModel = require('../../models/modelData/Question'); // Perhatikan path yang berubah

// Module exports a function that accepts cacheMiddleware and dbClient
module.exports = (cacheMiddleware, dbClient) => {
  // Buat instance dari QuestionModel dengan dbClient
  const questionModel = new QuestionModel(dbClient);

  // Get questions for a specific missionId
  // Endpoint ini akan menjadi /api/questions/:missionId (jika di-mount di /api/questions)
  router.get('/:missionId', cacheMiddleware('questions-by-mission'), async (req, res) => {
    try {
      const { missionId } = req.params;
      const questions = await questionModel.getQuestionsByMissionId(missionId);

      if (!questions || questions.length === 0) {
        return res.status(404).json({ error: 'No questions found for this mission' });
      }
      res.json(questions);
    } catch (err) {
      console.error('Error fetching questions in route:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get a single question by ID
  // Endpoint ini akan menjadi /api/questions/question/:id (jika di-mount di /api/questions)
  router.get('/question/:id', cacheMiddleware('question-by-id'), async (req, res) => {
    try {
      const { id } = req.params;
      const question = await questionModel.getQuestionById(id);

      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      res.json(question);
    } catch (err) {
      console.error('Error fetching single question in route:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};