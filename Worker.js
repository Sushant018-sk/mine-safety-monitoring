const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  employeeId:  { type: String, required: true, unique: true },
  mine:        { type: mongoose.Schema.Types.ObjectId, ref: 'Mine', required: true },
  shift:       { type: String, enum: ['A', 'B', 'C'], default: 'A' },
  designation: { type: String, default: 'Miner' },
  location:    { type: String, default: 'Surface' },
  status:      { type: String, enum: ['active', 'surface', 'off-duty'], default: 'surface' },
  phone:       { type: String, default: '' },
  checkInTime: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Worker', workerSchema);
