const express = require('express');
const router = express.Router();

// Module exports a function that accepts cacheMiddleware and dbClient
module.exports = (cacheMiddleware, dbClient) => {
  // Get leaderboard data
  router.get('/', cacheMiddleware('leaderboard'), async (req, res) => {
    try {
      // SQL query to sum scores for each username and sort by total score descending
      const { rows } = await dbClient.query(
        `
        SELECT username, SUM(score) as totalScore
        FROM leaderboard
        GROUP BY username
        ORDER BY totalScore DESC
        LIMIT 10
        `
      );
      res.json(rows);
    } catch (err) {
      console.error('Error fetching leaderboard:', err.stack);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Submit score to leaderboard
  router.post('/', async (req, res) => {
    const { userName, score, missionId } = req.body;
    if (!userName || score === undefined || missionId === undefined) {
      return res.status(400).json({ error: 'User name, score, and mission ID are required.' });
    }

    try {
      // Check for existing entry for the user
      const { rows } = await dbClient.query(
        'SELECT * FROM leaderboard WHERE username = $1 AND mission_id = $2',
        [userName, missionId]
      );

      let leaderboardEntry;
      if (rows.length > 0) {
        // Update existing entry by adding score
        const updatedScore = rows[0].score + score;
        const { rows: updatedRows } = await dbClient.query(
          `
          UPDATE leaderboard
          SET score = $1, updated_at = CURRENT_TIMESTAMP
          WHERE username = $2 AND mission_id = $3
          RETURNING *
          `,
          [updatedScore, userName, missionId]
        );
        leaderboardEntry = updatedRows[0];
      } else {
        // Insert new entry
        const { rows: insertedRows } = await dbClient.query(
          `
          INSERT INTO leaderboard (username, score, mission_id, created_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          RETURNING *
          `,
          [userName, score, missionId]
        );
        leaderboardEntry = insertedRows[0];
      }

      // Clear leaderboard cache when new score is submitted
      req.app.get('cache').del('leaderboard-all');
      res.status(201).json(leaderboardEntry);
    } catch (err) {
      console.error('Error submitting score to leaderboard:', err.stack);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};