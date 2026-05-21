const express  = require('express');
const router   = express.Router();
const Incident = require('../models/Incident');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const filter = req.query.mineId ? { mine: req.query.mineId } : {};
    const incidents = await Incident.find(filter)
      .populate('mine',       'name code')
      .populate('reportedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(incidents);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', protect, async (req, res) => {
  try {
    const incident = await Incident.create({ ...req.body, reportedBy: req.user._id });
    req.io.emit('new-incident', incident); // notify all browsers
    res.status(201).json(incident);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id/resolve', protect, async (req, res) => {
  try {
    const inc = await Incident.findByIdAndUpdate(
      req.params.id,
      { status: 'resolved', actionTaken: req.body.actionTaken || '', resolvedAt: new Date() },
      { new: true }
    );
    res.json(inc);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', protect, async (req, res) => {
  try { res.json(await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
