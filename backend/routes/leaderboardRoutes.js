// server/routes/leaderboardRoutes.js
const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');

// Perhatikan bahwa module.exports sekarang adalah sebuah fungsi
// yang menerima cacheMiddleware sebagai argumen.
module.exports = (cacheMiddleware) => { // <-- Pastikan ini menerima cacheMiddleware
  // Get leaderboard data
  router.get('/', cacheMiddleware('leaderboard'), async (req, res) => {
    try {
      // Aggregate to sum scores for each user and sort by total score descending
      const leaderboard = await Leaderboard.aggregate([
        {
          $group: {
            _id: "$userName",
            totalScore: { $sum: "$totalScore" }
          }
        },
        { $sort: { totalScore: -1 } }, // Sort by totalScore descending
        { $limit: 10 } // Get top 10 players
      ]);
      res.json(leaderboard);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
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
      // Find existing entry for the user or create a new one
      let leaderboardEntry = await Leaderboard.findOne({ userName });

      if (leaderboardEntry) {
        leaderboardEntry.totalScore += score; // Add new score to total
        leaderboardEntry.lastUpdated = new Date();
      } else {
        leaderboardEntry = new Leaderboard({
          userName,
          totalScore: score
        });
      }
      await leaderboardEntry.save();
      // Clear leaderboard cache when new score is submitted
      req.app.get('cache').del('leaderboard-all');
      res.status(201).json(leaderboardEntry);
    } catch (err) {
      console.error('Error submitting score to leaderboard:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};