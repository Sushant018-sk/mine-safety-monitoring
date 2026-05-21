const express  = require('express');
const router   = express.Router();
const Mine     = require('../models/Mine');
const Worker   = require('../models/Worker');
const Alert    = require('../models/Alert');
const Incident = require('../models/Incident');
const Sensor   = require('../models/Sensor');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const [activeMines, totalWorkers, activeWorkers, unresolvedAlerts,
           criticalAlerts, openIncidents, totalSensors] = await Promise.all([
      Mine.countDocuments({ status: 'active' }),
      Worker.countDocuments(),
      Worker.countDocuments({ status: 'active' }),
      Alert.countDocuments({ isResolved: false }),
      Alert.countDocuments({ isResolved: false, level: 'critical' }),
      Incident.countDocuments({ status: { $ne: 'resolved' } }),
      Sensor.countDocuments({ isActive: true }),
    ]);

    const recentAlerts    = await Alert.find({ isResolved: false })
      .sort({ createdAt: -1 }).limit(10).populate('mine', 'name');
    const recentIncidents = await Incident.find()
      .sort({ createdAt: -1 }).limit(5).populate('mine', 'name');
    const alertsByType    = await Alert.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      activeMines, totalWorkers, activeWorkers,
      unresolvedAlerts, criticalAlerts, openIncidents, totalSensors,
      recentAlerts, recentIncidents, alertsByType,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
