const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Get all questions for a mission
router.get('/:missionId', async (req, res) => {
  try {
    const questions = await Question.find({ missionId: req.params.missionId });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new question (admin only, add authentication in production)
router.post('/', async (req, res) => {
  const question = new Question({
    missionId: req.body.missionId,
    questionText: req.body.questionText,
    options: req.body.options,
    correctAnswer: req.body.correctAnswer,
    score: req.body.score,
  });
  try {
    const newQuestion = await question.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a question
router.put('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    Object.assign(question, req.body);
    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a question
router.delete('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    await question.remove();
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;