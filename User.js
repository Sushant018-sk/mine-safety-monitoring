const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true },
  role:       { type: String, enum: ['admin', 'safety_officer', 'supervisor', 'worker'], default: 'safety_officer' },
  employeeId: { type: String, unique: true },
  mine:       { type: mongoose.Schema.Types.ObjectId, ref: 'Mine', default: null },
  phone:      { type: String, default: '' },
  isActive:   { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before saving to DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
