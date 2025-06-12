const express = require('express');
const router = express.Router();
const Leaderboard = require('../models/Leaderboard');

// Get leaderboard for a mission
router.get('/:missionId', async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find({ missionId: req.params.missionId })
      .sort({ score: -1 })
      .limit(10);
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add leaderboard entry
router.post('/', async (req, res) => {
  const entry = new Leaderboard({
    userName: req.body.userName,
    score: req.body.score,
    missionId: req.body.missionId,
  });
  try {
    const newEntry = await entry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;