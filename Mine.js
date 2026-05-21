const mongoose = require('mongoose');

const mineSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  code:        { type: String, required: true, unique: true },
  location:    { type: String, required: true },
  depth:       { type: Number, default: 0 },          // metres underground
  type:        { type: String, enum: ['underground', 'opencast'], default: 'underground' },
  status:      { type: String, enum: ['active', 'maintenance', 'closed'], default: 'active' },
  capacity:    { type: Number, default: 0 },           // max workers allowed
  production:  { type: Number, default: 0 },           // tonnes/day target
  manager:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Mine', mineSchema);
