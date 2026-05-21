const express = require('express');
const router  = express.Router();
const Worker  = require('../models/Worker');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const filter = req.query.mineId ? { mine: req.query.mineId } : {};
    res.json(await Worker.find(filter).populate('mine', 'name code'));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', protect, async (req, res) => {
  try { res.status(201).json(await Worker.create(req.body)); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try { res.json(await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

// Worker check-in (enters the mine)
router.put('/:id/checkin', protect, async (req, res) => {
  try {
    const w = await Worker.findByIdAndUpdate(
      req.params.id,
      { status: 'active', location: req.body.location || 'Shaft Entry', checkInTime: new Date() },
      { new: true }
    );
    req.io.emit('worker-update', w); // real-time update to all browsers
    res.json(w);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Worker check-out (leaves the mine)
router.put('/:id/checkout', protect, async (req, res) => {
  try {
    const w = await Worker.findByIdAndUpdate(
      req.params.id,
      { status: 'surface', location: 'Surface', checkInTime: null },
      { new: true }
    );
    req.io.emit('worker-update', w);
    res.json(w);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
