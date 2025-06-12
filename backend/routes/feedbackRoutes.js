const express = require('express');
  const router = express.Router();
  const { body, validationResult } = require('express-validator');
  const { Feedback } = require('../models/Feedback');

  router.post('/', [
    body('userName').trim().notEmpty(),
    body('feedback').trim().notEmpty()
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { userName, feedback } = req.body;
      const entry = new Feedback({ userName, feedback });
      await entry.save();
      res.status(200).send('Feedback submitted');
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  module.exports = router;