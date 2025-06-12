const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Question } = require('../models/Question');

const adminAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || auth !== 'Basic YWRtaW46cGFzc3dvcmQxMjM=') { // admin:password123 base64
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

router.get('/questions', adminAuth, async (req, res) => {
  try {
    const questions = await Question.find().lean();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/questions', adminAuth, [
  body('type').trim().notEmpty(),
  body('questionText').trim().notEmpty(),
  body('correctAnswer').trim().notEmpty(),
  body('score').isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const question = new Question(req.body);
    await question.save();
    req.app.get('cache').del('questions'); // Invalidate cache
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;