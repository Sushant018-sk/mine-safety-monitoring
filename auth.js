const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, mine, phone } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    const count = await User.countDocuments();
    const user  = await User.create({
      name, email, password,
      role:       role  || 'safety_officer',
      mine:       mine  || null,
      phone:      phone || '',
      employeeId: `CCL${String(count + 1).padStart(5, '0')}`,
    });

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, employeeId: user.employeeId,
      token: signToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email }).populate('mine', 'name code');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, employeeId: user.employeeId, mine: user.mine,
      token: signToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me  — get logged-in user info
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate('mine', 'name code');
  res.json(user);
});

module.exports = router;
