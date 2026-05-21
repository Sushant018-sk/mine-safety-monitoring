const mongoose  = require('mongoose');
const User      = require('./models/User');
const Mine      = require('./models/Mine');
const Sensor    = require('./models/Sensor');
const Worker    = require('./models/Worker');
const Incident  = require('./models/Incident');
require('dotenv').config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  // Clear all collections
  await Promise.all([User, Mine, Sensor, Worker, Incident].map(M => M.deleteMany({})));
  console.log('Old data cleared');

  // ── Create Users ────────────────────────────────────────────────────────────
  const admin = await User.create({ name: 'Admin CCL',      email: 'admin@ccl.com',    password: 'password123', role: 'admin',          employeeId: 'CCL00001' });
  const so1   = await User.create({ name: 'Rajesh Sharma',  email: 'rajesh@ccl.com',   password: 'password123', role: 'safety_officer', employeeId: 'CCL00002' });
  const so2   = await User.create({ name: 'Anita Gupta',    email: 'anita@ccl.com',    password: 'password123', role: 'safety_officer', employeeId: 'CCL00003' });
  const sup   = await User.create({ name: 'Manoj Kumar',    email: 'manoj@ccl.com',    password: 'password123', role: 'supervisor',     employeeId: 'CCL00004' });

  // ── Create Mines ────────────────────────────────────────────────────────────
  const mine1 = await Mine.create({ name: 'Rajrappa UG Mine',  code: 'RJP-01', location: 'Ramgarh, Jharkhand',    depth: 450, type: 'underground', status: 'active', capacity: 200, production: 2500, manager: so1._id });
  const mine2 = await Mine.create({ name: 'Kathara OC Mine',   code: 'KTH-02', location: 'Hazaribagh, Jharkhand', depth: 80,  type: 'opencast',    status: 'active', capacity: 150, production: 4000, manager: so2._id });
  const mine3 = await Mine.create({ name: 'Kedla UG Mine',     code: 'KDL-03', location: 'Ramgarh, Jharkhand',    depth: 320, type: 'underground', status: 'maintenance', capacity: 100, production: 1200, manager: sup._id });

  // ── Create Sensors for Mine 1 ───────────────────────────────────────────────
  await Sensor.create([
    { sensorId: 'SEN-RJP-001', mine: mine1._id, location: 'Shaft-1 Level 1', depth: 150 },
    { sensorId: 'SEN-RJP-002', mine: mine1._id, location: 'Shaft-1 Level 2', depth: 250 },
    { sensorId: 'SEN-RJP-003', mine: mine1._id, location: 'Shaft-2 Level 1', depth: 150 },
    { sensorId: 'SEN-RJP-004', mine: mine1._id, location: 'Shaft-2 Level 3', depth: 380 },
    { sensorId: 'SEN-RJP-005', mine: mine1._id, location: 'Main Gallery',    depth: 200 },
  ]);

  // ── Create Sensors for Mine 2 ───────────────────────────────────────────────
  await Sensor.create([
    { sensorId: 'SEN-KTH-001', mine: mine2._id, location: 'Pit-1 North Face', depth: 40 },
    { sensorId: 'SEN-KTH-002', mine: mine2._id, location: 'Pit-1 South Face', depth: 60 },
    { sensorId: 'SEN-KTH-003', mine: mine2._id, location: 'Pit-2 East Face',  depth: 75 },
  ]);

  // ── Create Workers ──────────────────────────────────────────────────────────
  await Worker.create([
    { name: 'Suresh Mahto',   employeeId: 'WRK001', mine: mine1._id, shift: 'A', designation: 'Miner',            location: 'Shaft-1 Level 2', status: 'active' },
    { name: 'Ramu Oraon',     employeeId: 'WRK002', mine: mine1._id, shift: 'A', designation: 'Driller',           location: 'Shaft-2 Level 1', status: 'active' },
    { name: 'Birsa Munda',    employeeId: 'WRK003', mine: mine1._id, shift: 'A', designation: 'Blaster',           location: 'Main Gallery',    status: 'active' },
    { name: 'Lakhan Singh',   employeeId: 'WRK004', mine: mine1._id, shift: 'B', designation: 'Miner',             location: 'Surface',         status: 'surface' },
    { name: 'Dhaniram Lohra', employeeId: 'WRK005', mine: mine1._id, shift: 'B', designation: 'Equipment Operator',location: 'Surface',         status: 'surface' },
    { name: 'Phagu Bhuiyan',  employeeId: 'WRK006', mine: mine1._id, shift: 'A', designation: 'Helper',            location: 'Shaft-1 Level 1', status: 'active' },
    { name: 'Mangal Mahali',  employeeId: 'WRK007', mine: mine1._id, shift: 'C', designation: 'Miner',             location: 'Surface',         status: 'off-duty' },
    { name: 'Sonu Ravidas',   employeeId: 'WRK008', mine: mine1._id, shift: 'A', designation: 'Pump Operator',     location: 'Shaft-2 Level 3', status: 'active' },
  ]);

  // ── Create Past Incidents ───────────────────────────────────────────────────
  await Incident.create([
    { mine: mine1._id, title: 'Minor Gas Leakage in Shaft-2',  description: 'Methane briefly exceeded safe limits at Level 2', type: 'gas_leak', severity: 'medium', location: 'Shaft-2 Level 2', reportedBy: so1._id, status: 'resolved', actionTaken: 'Ventilation increased, area evacuated temporarily', resolvedAt: new Date(Date.now() - 86400000) },
    { mine: mine1._id, title: 'Worker Injury - Shaft-1',        description: 'Worker slipped on wet surface, minor ankle injury', type: 'injury', severity: 'low', location: 'Shaft-1 Level 1', reportedBy: sup._id, status: 'resolved', actionTaken: 'First aid given, anti-slip mats installed', resolvedAt: new Date(Date.now() - 172800000) },
    { mine: mine2._id, title: 'Equipment Malfunction - Pit-2',  description: 'Excavator hydraulic failure detected', type: 'other', severity: 'medium', location: 'Pit-2 East Face', reportedBy: so2._id, status: 'investigating', actionTaken: 'Equipment isolated, maintenance team called' },
  ]);

  console.log('\nSeed complete. Use these accounts to login:\n');
  console.log('  admin@ccl.com     -> Admin');
  console.log('  rajesh@ccl.com    -> Safety Officer');
  console.log('  anita@ccl.com     -> Safety Officer');
  console.log('  manoj@ccl.com     -> Supervisor');
  console.log('\n  Password for all: password123\n');
  process.exit(0);
};

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
