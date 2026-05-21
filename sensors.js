const express       = require('express');
const router        = express.Router();
const Sensor        = require('../models/Sensor');
const SensorReading = require('../models/SensorReading');
const { protect }   = require('../middleware/auth');

// GET all sensors (optionally filter by mine)
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.query.mineId ? { mine: req.query.mineId } : {};
    res.json(await Sensor.find(filter).populate('mine', 'name code'));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST create new sensor
router.post('/', protect, async (req, res) => {
  try { res.status(201).json(await Sensor.create(req.body)); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

// GET last N readings for a specific sensor (for the chart)
router.get('/:id/readings', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 30;
    const readings = await SensorReading.find({ sensor: req.params.id })
      .sort({ createdAt: -1 }).limit(limit);
    res.json(readings.reverse()); // oldest first for chart
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET latest reading for every sensor in a mine
router.get('/mine/:mineId/latest', protect, async (req, res) => {
  try {
    const sensors = await Sensor.find({ mine: req.params.mineId, isActive: true });
    const results = await Promise.all(sensors.map(async (s) => {
      const reading = await SensorReading.findOne({ sensor: s._id }).sort({ createdAt: -1 });
      return { sensor: s, reading };
    }));
    res.json(results);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT update sensor (activate / deactivate)
router.put('/:id', protect, async (req, res) => {
  try { res.json(await Sensor.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
