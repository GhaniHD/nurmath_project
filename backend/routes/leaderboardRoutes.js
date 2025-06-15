const express = require('express');
const router = express.Router();

module.exports = (cacheMiddleware, dbClient) => {
  const LeaderboardModel = new (require('../models/Leaderboard'))(dbClient);

  router.post('/', async (req, res) => {
    const { userId, userName, score, missionId } = req.body;
    console.log('POST /api/leaderboard:', { userId, userName, score, missionId });

    if (!userId || !userName || score === undefined || !missionId) {
      console.warn('Validasi gagal:', { userId, userName, score, missionId });
      return res.status(400).json({ error: 'User ID, name, score, and mission ID are required.' });
    }

    try {
      const leaderboardEntry = await LeaderboardModel.submitScore(userId, userName, score, missionId);
      const cache = req.app.get('cache');
      if (cache) {
        console.log('Cache object:', cache);
        if (typeof cache.del === 'function') {
          const success = cache.del('leaderboard-all');
          if (success) {
            console.log('Cache leaderboard-all berhasil dihapus');
          } else {
            console.warn('Gagal menghapus cache leaderboard-all');
          }
          // Perbarui cache dengan data terbaru
          const updatedLeaderboard = await LeaderboardModel.getTopLeaderboardEntries();
          if (typeof cache.set === 'function') {
            cache.set('leaderboard-all', updatedLeaderboard);
            console.log('Cache leaderboard-all diperbarui dengan data terbaru');
          }
        } else {
          console.warn('Cache object does not support del method');
        }
      }
      res.status(201).json(leaderboardEntry);
    } catch (err) {
      console.error('Error POST /api/leaderboard:', err.stack);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/', cacheMiddleware('leaderboard'), async (req, res) => {
    try {
      console.log('GET /api/leaderboard');
      const leaderboard = await LeaderboardModel.getTopLeaderboardEntries();
      res.json(leaderboard);
    } catch (err) {
      console.error('Error GET /api/leaderboard:', err.stack);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};