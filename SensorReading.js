const mongoose = require('mongoose');

const readingSchema = new mongoose.Schema({
  sensor:      { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor', required: true },
  mine:        { type: mongoose.Schema.Types.ObjectId, ref: 'Mine',   required: true },
  gas:         { type: Number, default: 0 },   // % CH4
  co:          { type: Number, default: 0 },   // ppm
  temperature: { type: Number, default: 0 },   // °C
  humidity:    { type: Number, default: 0 },   // %
  seismic:     { type: Number, default: 0 },   // Richter
  oxygen:      { type: Number, default: 0 },   // %
}, { timestamps: true });

// Auto-delete readings older than 24 hours to save DB space
readingSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('SensorReading', readingSchema);
