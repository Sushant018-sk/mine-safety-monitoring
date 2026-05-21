const express  = require('express');
const http     = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use((req, _res, next) => { req.io = io; next(); }); // attach io to every request

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/mines',     require('./routes/mines'));
app.use('/api/sensors',   require('./routes/sensors'));
app.use('/api/alerts',    require('./routes/alerts'));
app.use('/api/workers',   require('./routes/workers'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.get('/', (_req, res) => res.json({ message: 'CCL Mine Safety API v1.0' }));

// ── Sensor Simulation ─────────────────────────────────────────────────────────
const Sensor        = require('./models/Sensor');
const SensorReading = require('./models/SensorReading');
const Alert         = require('./models/Alert');

// Safety thresholds for each parameter
const THRESHOLDS = {
  gas:         { warning: 1.0, critical: 2.0 },  // % CH4 methane
  co:          { warning: 25,  critical: 50  },  // ppm carbon monoxide
  temperature: { warning: 32,  critical: 38  },  // °C
  humidity:    { warning: 85,  critical: 95  },  // %
  seismic:     { warning: 2.5, critical: 4.0 },  // Richter scale
  oxygen:      { warning: 19.5,critical: 18.0 }, // % (low = danger, inverted)
};

const UNITS = { gas:'% CH4', co:'ppm', temperature:'°C', humidity:'%', seismic:'R', oxygen:'%' };

// Store a "base" value for each sensor so readings drift gradually (realistic)
const sensorBases = {};

function randomFluctuation(base, range) {
  return +(base + (Math.random() - 0.5) * range).toFixed(2);
}

function getAlertLevel(type, value) {
  const t = THRESHOLDS[type];
  if (!t) return null;
  if (type === 'oxygen') {
    if (value <= t.critical) return 'critical';
    if (value <= t.warning)  return 'warning';
    return null;
  }
  if (value >= t.critical) return 'critical';
  if (value >= t.warning)  return 'warning';
  return null;
}

async function simulateSensors() {
  try {
    const sensors = await Sensor.find({ isActive: true }).populate('mine');
    for (const sensor of sensors) {
      // Initialize base values if first run
      if (!sensorBases[sensor._id]) {
        sensorBases[sensor._id] = {
          gas: 0.3, co: 10, temperature: 28,
          humidity: 70, seismic: 0.5, oxygen: 20.9,
        };
      }
      const base = sensorBases[sensor._id];

      // Gradually drift values (simulates real sensor behavior)
      base.gas         = Math.max(0,    Math.min(5,    randomFluctuation(base.gas,         0.12)));
      base.co          = Math.max(0,    Math.min(100,  randomFluctuation(base.co,           2.5)));
      base.temperature = Math.max(20,   Math.min(45,   randomFluctuation(base.temperature,  0.4)));
      base.humidity    = Math.max(40,   Math.min(100,  randomFluctuation(base.humidity,      1.0)));
      base.seismic     = Math.max(0,    Math.min(7,    randomFluctuation(base.seismic,       0.15)));
      base.oxygen      = Math.max(16,   Math.min(21,   randomFluctuation(base.oxygen,        0.08)));

      const reading = { ...base };

      // Save to DB
      await SensorReading.create({
        sensor: sensor._id,
        mine:   sensor.mine._id,
        ...reading,
      });

      // Check thresholds → create alerts if needed
      for (const [type, value] of Object.entries(reading)) {
        const level = getAlertLevel(type, value);
        if (level) {
          const alert = await Alert.create({
            sensor:  sensor._id,
            mine:    sensor.mine._id,
            type,
            value,
            level,
            message: `${type.toUpperCase()} ${level.toUpperCase()} at ${sensor.location}: ${value} ${UNITS[type]}`,
            isResolved: false,
          });
          io.emit('new-alert', alert); // Push to all connected browsers instantly
        }
      }

      // Push live reading to all connected browsers
      io.emit('sensor-update', {
        sensorId:  sensor._id,
        sensorCode:sensor.sensorId,
        mineId:    sensor.mine._id,
        location:  sensor.location,
        ...reading,
        timestamp: new Date(),
      });
    }
  } catch (err) {
    console.error('Simulation error:', err.message);
  }
}

// ── Socket.io Events ──────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`Browser connected: ${socket.id}`);

  // Join a specific mine's room for targeted updates
  socket.on('join-mine', (mineId) => {
    socket.join(mineId);
    console.log(`   Joined mine room: ${mineId}`);
  });

  // Manual sensor override from the demo panel
  socket.on('manual-override', async (data) => {
    const { sensorId, type, value } = data;
    if (sensorBases[sensorId]) {
      sensorBases[sensorId][type] = value; // Override the base value
    }
    console.log(`Manual override: Sensor ${sensorId} -> ${type} = ${value}`);
  });

  // SOS emergency button pressed by worker
  socket.on('sos', async (data) => {
    try {
      const alert = await Alert.create({
        mine:    data.mineId,
        type:    'sos',
        value:   1,
        level:   'critical',
        message: `SOS EMERGENCY from Worker: ${data.workerName} at ${data.location}`,
        isResolved: false,
      });
      io.emit('new-alert', alert);
      io.emit('sos-received', { ...data, alertId: alert._id });
      console.log(`SOS received from ${data.workerName}`);
    } catch (err) {
      console.error('SOS error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Browser disconnected: ${socket.id}`);
  });
});

// ── Connect DB & Start Server ─────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(process.env.PORT, () => {
      console.log(`Server running on http://localhost:${process.env.PORT}`);
      // Start sensor simulation — fires every 4 seconds
      setInterval(simulateSensors, 4000);
      console.log('Sensor simulation started (every 4 seconds)');
    });
  })
  .catch(err => { console.error('MongoDB error:', err.message); process.exit(1); });
