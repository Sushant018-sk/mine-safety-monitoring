const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  sensorId:  { type: String, required: true, unique: true }, // e.g. SEN-RJP-001
  mine:      { type: mongoose.Schema.Types.ObjectId, ref: 'Mine', required: true },
  location:  { type: String, required: true },               // e.g. "Shaft-2 Level 3"
  depth:     { type: Number, default: 0 },                   // metres below surface
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Sensor', sensorSchema);
