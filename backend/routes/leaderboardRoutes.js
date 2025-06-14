const express = require('express');
const router = express.Router();
const LeaderboardModel = require('../models/Leaderboard'); // Import model Leaderboard

// Module exports a function that accepts cacheMiddleware and dbClient
module.exports = (cacheMiddleware, dbClient) => {
  // Buat instance dari LeaderboardModel dengan dbClient
  const leaderboardModel = new LeaderboardModel(dbClient);

  // Get leaderboard data
  router.get('/', cacheMiddleware('leaderboard'), async (req, res) => {
    try {
      const leaderboardData = await leaderboardModel.getTopLeaderboardEntries();
      res.json(leaderboardData);
    } catch (err) {
      console.error('Error fetching leaderboard in route:', err.message);
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
      const leaderboardEntry = await leaderboardModel.submitScore(userName, score, missionId);

      // Clear leaderboard cache when new score is submitted
      // req.app.get('cache') diakses dari app (server.js)
      req.app.get('cache').del('leaderboard-all'); // Assuming 'leaderboard-all' is the key used for the main leaderboard list
      res.status(201).json(leaderboardEntry);
    } catch (err) {
      console.error('Error submitting score to leaderboard in route:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};