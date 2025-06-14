const express = require('express');
const router = express.Router();

// Module exports a function that accepts cacheMiddleware and dbClient
module.exports = (cacheMiddleware, dbClient) => {
  // Get questions for a specific missionId
  router.get('/:missionId', cacheMiddleware('questions-by-mission'), async (req, res) => {
    try {
      const { missionId } = req.params;
      const { rows } = await dbClient.query(
        'SELECT * FROM questions WHERE mission_id = $1',
        [missionId]
      );
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'No questions found for this mission' });
      }
      res.json(rows);
    } catch (err) {
      console.error('Error fetching questions:', err.stack);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get a single question by ID
  router.get('/question/:id', cacheMiddleware('question-by-id'), async (req, res) => {
    try {
      const { id } = req.params;
      const { rows } = await dbClient.query(
        'SELECT * FROM questions WHERE id = $1',
        [id]
      );
      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'Question not found' });
      }
      res.json(rows[0]); // Return the first (and only) row
    } catch (err) {
      console.error('Error fetching single question:', err.stack);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};