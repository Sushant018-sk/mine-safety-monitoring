const express = require('express');
const router  = express.Router();
const Alert   = require('../models/Alert');
const { protect } = require('../middleware/auth');

// GET alerts with optional filters
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.mineId)   filter.mine       = req.query.mineId;
    if (req.query.level)    filter.level       = req.query.level;
    if (req.query.resolved !== undefined)
      filter.isResolved = req.query.resolved === 'true';

    const alerts = await Alert.find(filter)
      .populate('mine',   'name code')
      .populate('sensor', 'location sensorId')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 100);
    res.json(alerts);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT resolve an alert
router.put('/:id/resolve', protect, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isResolved: true, resolvedBy: req.user._id, resolvedAt: new Date(), notes: req.body.notes || '' },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    req.io.emit('alert-resolved', alert._id); // tell all browsers this alert is resolved
    res.json(alert);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET alert statistics
router.get('/stats', protect, async (req, res) => {
  try {
    const [total, critical, warning, unresolved] = await Promise.all([
      Alert.countDocuments(),
      Alert.countDocuments({ level: 'critical' }),
      Alert.countDocuments({ level: 'warning' }),
      Alert.countDocuments({ isResolved: false }),
    ]);
    res.json({ total, critical, warning, unresolved });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
