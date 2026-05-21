const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  sensor:     { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor', default: null },
  mine:       { type: mongoose.Schema.Types.ObjectId, ref: 'Mine',   required: true },
  type:       { type: String, required: true },  // gas | co | temperature | seismic | oxygen | sos
  value:      { type: Number, default: 0 },
  level:      { type: String, enum: ['warning', 'critical'], default: 'warning' },
  message:    { type: String, required: true },
  isResolved: { type: Boolean, default: false },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  resolvedAt: { type: Date, default: null },
  notes:      { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
