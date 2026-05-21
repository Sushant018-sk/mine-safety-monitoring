const express = require('express');
const router  = express.Router();
const Mine    = require('../models/Mine');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try { res.json(await Mine.find().populate('manager', 'name email')); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', protect, async (req, res) => {
  try { res.status(201).json(await Mine.create(req.body)); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const m = await Mine.findById(req.params.id).populate('manager', 'name');
    if (!m) return res.status(404).json({ message: 'Mine not found' });
    res.json(m);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try { res.json(await Mine.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
