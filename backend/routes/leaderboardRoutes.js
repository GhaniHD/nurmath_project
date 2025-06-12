const express = require('express');
  const router = express.Router();
  const { body, validationResult } = require('express-validator');
  const { Leaderboard } = require('../models/Leaderboard');
  const { cacheMiddleware } = require('../server');

  router.post('/', [
    body('userName').trim().notEmpty(),
    body('score').isInt({ min: 0 }),
    body('missionId').trim().notEmpty()
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { userName, score, missionId } = req.body;
      const entry = new Leaderboard({ userName, score, missionId });
      await entry.save();
      req.app.get('cache').del('leaderboard'); // Invalidate cache
      res.status(200).send('Leaderboard updated');
    } catch (err) {
      res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  });

  router.get('/', cacheMiddleware('leaderboard'), async (req, res) => { // Removed :type?
    try {
      const leaders = await Leaderboard.find().sort({ score: -1 }).limit(10).lean(); // Default to top 10
      res.json(leaders);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  });

  module.exports = router;