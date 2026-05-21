# CCL SafetyNet — Coal Mine Safety Monitoring Dashboard

A full-stack real-time web application for monitoring safety conditions at
underground and opencast coal mines. Built as a student project / internship
deliverable for CCL (Central Coalfields Limited), Ranchi.

The system simulates a fleet of IoT sensors (methane, carbon monoxide,
temperature, humidity, seismic activity, oxygen), streams their readings to a
React dashboard over WebSockets, and raises alerts the moment a reading
crosses a safety threshold. Workers can be checked in / out of mines and can
trigger SOS emergencies. Incidents can be reported and resolved. The whole
stack runs on `localhost` for demonstration.

> For step-by-step setup instructions on a new laptop, see **[guide.md](guide.md)**.

---

## Tech Stack

**Backend**
- Node.js + Express — REST API
- MongoDB + Mongoose — persistence
- Socket.io — live updates to the browser
- JSON Web Tokens — authentication
- bcryptjs — password hashing

**Frontend**
- React 18 (Create React App)
- React Router — page navigation
- Axios — HTTP calls to the API
- socket.io-client — live updates
- Recharts — charts on Dashboard and Live Monitor

**Why these choices**
- Node.js handles many concurrent WebSocket connections efficiently, which
  matters for a real-time monitoring app.
- MongoDB's flexible documents fit nicely with mixed-shape sensor readings.
- Socket.io abstracts away reconnection / fallback logic, so the dashboard
  keeps working even on a flaky network.
- JWT keeps the API stateless: the server does not store sessions.

---

## Quick Start (Short Version)

Full instructions, including how to install Node.js and MongoDB, are in
**[guide.md](guide.md)**.

```
# Prerequisites: Node.js 18+ and MongoDB running on localhost:27017

# Backend
cd backend
npm install
node seed.js          # one-time, populates demo data
npm run dev           # http://localhost:5000

# Frontend (in a second terminal)
cd frontend
npm install
npm start             # http://localhost:3000
```

Then log in at http://localhost:3000 with one of the demo accounts:

| Email | Role | Password |
|---|---|---|
| admin@ccl.com | Admin | password123 |
| rajesh@ccl.com | Safety Officer | password123 |
| anita@ccl.com | Safety Officer | password123 |
| manoj@ccl.com | Supervisor | password123 |

---

## Project Layout

```
mine-safety/
  backend/
    .env                 environment variables (Mongo URL, JWT secret, port)
    server.js            Express app, Socket.io, sensor simulation loop
    seed.js              one-time database seeder (users, mines, sensors, ...)
    models/              Mongoose schemas
      User.js
      Mine.js
      Sensor.js
      SensorReading.js   has a 24h TTL index — readings auto-delete
      Alert.js
      Worker.js
      Incident.js
    routes/              one router per resource
      auth.js            register, login, get current user
      mines.js
      sensors.js
      alerts.js
      workers.js         includes check-in / check-out / SOS
      incidents.js
      dashboard.js       aggregate stats for the home page
    middleware/
      auth.js            JWT verification on protected routes
  frontend/
    public/index.html
    src/
      index.js           React entry point
      App.js             routes + auth wrapper
      index.css          global styles
      api/index.js       axios + socket.io client setup
      context/AuthContext.js   shared login state
      components/Layout.js     sidebar + live alert ticker
      pages/
        Login.js
        Dashboard.js
        LiveMonitor.js   real-time sensor cards + live chart
        Alerts.js
        Workers.js
        Incidents.js
        Mines.js
        DemoPanel.js     manual sensor override sliders
  guide.md               setup walkthrough for a new laptop
  README.md              this file
```

---

## REST API Endpoints

All `/api/*` routes except `/api/auth/login` and `/api/auth/register` require
an `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Log in, returns a JWT |
| GET  | /api/auth/me | Get the current user |
| GET  | /api/mines | List all mines |
| POST | /api/mines | Create a mine |
| GET  | /api/sensors | List all sensors |
| GET  | /api/sensors/mine/:id/latest | Latest reading per sensor for a mine |
| GET  | /api/sensors/:id/readings | Historical readings for a sensor |
| GET  | /api/alerts | List alerts |
| PUT  | /api/alerts/:id/resolve | Mark an alert as resolved |
| GET  | /api/workers | List workers |
| POST | /api/workers | Add a worker |
| PUT  | /api/workers/:id/checkin | Check a worker into a mine |
| PUT  | /api/workers/:id/checkout | Check a worker out |
| GET  | /api/incidents | List incidents |
| POST | /api/incidents | Report a new incident |
| PUT  | /api/incidents/:id/resolve | Resolve an incident |
| GET  | /api/dashboard | Aggregate stats for the home page |

---

## Socket.io Events

| Event | Direction | Description |
|---|---|---|
| sensor-update | Server -> Browser | New reading from a sensor |
| new-alert | Server -> Browser | Alert created (threshold breached) |
| alert-resolved | Server -> Browser | Alert was resolved |
| sos-received | Server -> Browser | SOS emergency triggered |
| new-incident | Server -> Browser | New incident reported |
| worker-update | Server -> Browser | Worker status changed |
| manual-override | Browser -> Server | Demo Panel overrides a sensor base value |
| sos | Browser -> Server | Worker presses the SOS button |
| join-mine | Browser -> Server | Subscribe to a specific mine's events |

---

## Safety Thresholds

These values are hardcoded in `backend/server.js` and used by the simulation
loop to decide when to raise a warning or critical alert.

| Parameter | Warning | Critical | Unit |
|---|---|---|---|
| Methane (CH4) | > 1.0 | > 2.0 | % CH4 |
| Carbon Monoxide | > 25 | > 50 | ppm |
| Temperature | > 32 | > 38 | C |
| Humidity | > 85 | > 95 | % |
| Seismic | > 2.5 | > 4.0 | Richter |
| Oxygen | < 19.5 | < 18.0 | % |

Oxygen is the only inverted parameter — alerts fire when readings fall *below*
the threshold, since low oxygen is the dangerous condition.

---

## Sensor Simulation

The project has no physical IoT hardware. Instead, `backend/server.js` runs a
loop every 4 seconds that:

1. Fetches every active sensor from MongoDB.
2. Generates a new reading per parameter using a small random drift from the
   sensor's previous base value, so readings evolve smoothly rather than
   jumping around.
3. Persists the reading.
4. Checks every parameter against the thresholds above and, if breached,
   creates an Alert document and pushes it to all connected browsers via
   Socket.io.
5. Broadcasts the reading itself so the Live Monitor page updates in real time.

The Demo Panel page lets a presenter override any sensor's base value live —
useful for showing the alerting pipeline on demand.

---

Project by a KIIT University IT student during a CCL Ranchi internship.
