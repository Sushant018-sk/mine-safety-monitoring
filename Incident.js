const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  mine:        { type: mongoose.Schema.Types.ObjectId, ref: 'Mine', required: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  type:        { type: String, enum: ['gas_leak', 'fire', 'collapse', 'injury', 'explosion', 'flood', 'other'], required: true },
  severity:    { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  location:    { type: String, required: true },
  reportedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:      { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open' },
  actionTaken: { type: String, default: '' },
  resolvedAt:  { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);
