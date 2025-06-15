const express = require('express');
const router = express.Router();

module.exports = (client) => {
  router.post('/', async (req, res) => {
    const { userName } = req.body;

    if (!userName) {
      return res.status(400).json({ error: 'userName is required' });
    }

    try {
      const result = await client.query(
        'INSERT INTO users (username) VALUES ($1) RETURNING id, username',
        [userName]
      );
      const user = result.rows[0];
      res.status(201).json({
        userId: user.id,
        userName: user.username,
      });
    } catch (err) {
      console.error('Error creating user:', err.message);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  return router;
};
