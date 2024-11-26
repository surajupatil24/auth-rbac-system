const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const user = new User({ username, password, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error creating user', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = generateToken(user);
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

router.get('/admin', authenticate, authorize(['Admin']), (req, res) => {
  res.status(200).json({ message: 'Welcome, Admin!' });
});

router.get('/user', authenticate, authorize(['User', 'Admin', 'Moderator']), (req, res) => {
  res.status(200).json({ message: 'Welcome, User!' });
});

module.exports = router;