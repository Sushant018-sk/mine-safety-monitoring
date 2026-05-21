# CCL SafetyNet — Setup & Demo Guide

This guide walks you through running the project on a fresh laptop from scratch.
Total time: ~15 minutes (most of it waiting for `npm install`).

The project is a full-stack web application: a Node.js + Express + MongoDB backend
streaming live sensor data over Socket.io to a React frontend. The whole thing runs
on `localhost` — no cloud accounts, no deployment.

---

## 1. What You Need to Install First

| Software | Version | Why |
|---|---|---|
| Node.js | 18 or higher (LTS recommended) | Runs the backend and frontend dev server |
| MongoDB Community Server | 6.0 or higher | Stores users, sensor readings, alerts, etc. |
| A modern browser | Chrome / Edge / Firefox (latest) | To view the dashboard |

You do **not** need: Docker, Git, any cloud account, any paid service.

---

## 2. Install Node.js

### Windows
1. Go to https://nodejs.org/en/download
2. Download the **LTS** Windows Installer (.msi)
3. Run the installer → keep all defaults → click Next until Finish
4. Open a new **PowerShell** window (important: open a new one so PATH refreshes)
5. Verify:
   ```
   node --version
   npm --version
   ```
   Both commands should print a version number.

### macOS
```
brew install node
```
Or download from https://nodejs.org/en/download

---

## 3. Install MongoDB

### Windows
1. Go to https://www.mongodb.com/try/download/community
2. Select: Version = current, Platform = Windows, Package = msi
3. Download and run the installer
4. On the "Service Configuration" screen, **keep "Install MongoDB as a Service" checked**
   (this makes MongoDB start automatically every time you boot your laptop)
5. Finish the installer
6. Optional but recommended: also install **MongoDB Compass** when prompted
   (a GUI that lets you browse the database)

### Verify MongoDB is running (Windows)
Open PowerShell and run:
```
Get-Service -Name MongoDB
```
You should see `Status: Running`. If it says `Stopped`, start it with:
```
Start-Service MongoDB
```

### macOS
```
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

---

## 4. Verify Everything is Installed

Open a fresh terminal / PowerShell and run each command. All four should succeed:

```
node --version           # should print v18.x or higher
npm --version            # should print 9.x or higher
mongod --version         # should print db version v6.x or higher
```

If any command fails, fix that one before continuing.

---

## 5. Extract the Project

1. Unzip the project archive somewhere simple, for example:
   - Windows: `C:\Users\<you>\Desktop\mine-safety`
   - macOS:   `~/Desktop/mine-safety`
2. Open the extracted folder. You should see:
   ```
   mine-safety/
     backend/
     frontend/
     README.md
     guide.md   <-- this file
   ```

---

## 6. Configure the Backend Environment

The backend reads its settings from a file named `.env` inside the `backend/` folder.
This file is already included in the zip — **you do not need to create it** — but
you should open it once to confirm its contents:

`backend/.env`
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mine_safety
JWT_SECRET=mine_safety_secret_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
```

What each line means:
- **PORT** — the backend will listen on this port. Leave as 5000.
- **MONGO_URI** — where to find MongoDB. The database `mine_safety` will be
  created automatically the first time the backend connects. Leave as is.
- **JWT_SECRET** — a random string used to sign login tokens. Any value works
  for the demo.
- **JWT_EXPIRE** — how long a login session stays valid.
- **NODE_ENV** — leaving this as `development` enables friendlier error messages.

If MongoDB is running on a non-default port on your laptop, edit `MONGO_URI`
accordingly. Otherwise leave the file alone.

---

## 7. Install the Backend Dependencies

Open a terminal and run:

```
cd path\to\mine-safety\backend
npm install
```

This downloads ~150 packages (Express, Mongoose, Socket.io, JWT, bcrypt, etc.)
and takes 30–90 seconds depending on your internet speed.

When it finishes you'll see something like:
```
added 154 packages, and audited 155 packages in 16s
```

---

## 8. Seed the Database

This step creates the demo accounts, mines, sensors, workers, and incidents
inside MongoDB. **Run it exactly once** — running it again will wipe and re-create
the data.

From inside `backend/`:
```
node seed.js
```

Expected output:
```
Old data cleared
Seed complete! Use these accounts to login:

  admin@ccl.com     -> Admin
  rajesh@ccl.com    -> Safety Officer
  anita@ccl.com     -> Safety Officer
  manoj@ccl.com     -> Supervisor

  Password for all: password123
```

The MongoDB database is now named `mine_safety` and has 7 collections:
`users`, `mines`, `sensors`, `sensorreadings`, `alerts`, `workers`, `incidents`.

---

## 9. Start the Backend Server

From inside `backend/`:
```
npm run dev
```

Expected output (the server keeps running, do not close this terminal):
```
MongoDB connected
Server running on http://localhost:5000
Sensor simulation started (every 4 seconds)
```

Leave this terminal open. The backend is now running.

Quick sanity check — open a new browser tab and visit
http://localhost:5000 — you should see:
```json
{"message":"CCL Mine Safety API v1.0"}
```

---

## 10. Install the Frontend Dependencies

Open a **new** terminal (do not close the backend one).

```
cd path\to\mine-safety\frontend
npm install
```

This downloads the React toolchain (~1300 packages) and takes 1–3 minutes.
You may see some `npm warn deprecated` lines — those are safe to ignore.

---

## 11. Start the Frontend

From inside `frontend/`:
```
npm start
```

The first compile takes 30–60 seconds. When it's done you'll see:
```
Compiled successfully!

You can now view mine-safety-frontend in the browser.

  Local:    http://localhost:3000
```

The browser should open automatically. If it doesn't, open
http://localhost:3000 yourself.

---

## 12. Log In

You'll see the login page. There are two ways to sign in:

**Option A — Type credentials manually:**
- Email: `admin@ccl.com`
- Password: `password123`
- Click **Sign In**

**Option B — Quick demo buttons (faster):**
Click any of the three role buttons at the bottom of the login card
(Admin / Safety Officer / Supervisor). These auto-fill and log you in instantly
using the same `password123`. This is a demo convenience and would be removed
in a real production app.

| Email | Role |
|---|---|
| admin@ccl.com | Admin (sees everything) |
| rajesh@ccl.com | Safety Officer |
| anita@ccl.com | Safety Officer |
| manoj@ccl.com | Supervisor |

---

## 13. What to Demo (5-Minute Walkthrough)

Once you're logged in, walk through the pages in this order:

| # | Page | What to point out |
|---|---|---|
| 1 | **Dashboard** | KPI cards at the top, recent alerts list, pie chart of alert types. Refreshes via WebSocket. |
| 2 | **Live Monitor** | Sensor cards update automatically every 4 seconds. The line chart draws a new data point in real time. No page refresh needed. |
| 3 | **Alerts** | A live log of every threshold breach. Click "Resolve" on any alert and watch it instantly disappear on every other open tab too. |
| 4 | **Workers** | Worker roster with check-in / check-out buttons. Press the red **SOS** button on any worker — a critical alert appears in the top ticker on every page. |
| 5 | **Incidents** | Click "Report Incident", fill in the form, submit. It shows up in the table immediately. |
| 6 | **Mines** | The three seeded mines (Rajrappa, Kathara, Kedla). |
| 7 | **Demo Panel** | Drag the **Methane (gas)** slider above 2.0. Within 4 seconds a critical alert appears system-wide. This proves the threshold engine works end-to-end. |

### Real-time proof
To show that the WebSocket pipeline really works:
1. Open `http://localhost:3000` in **two browser tabs**, log in on both
2. In tab 1, go to **Demo Panel** and crank a slider into the red zone
3. In tab 2 (any page), the new alert pops up in the ticker bar without
   refreshing — that is Socket.io pushing live data.

---

## 14. Stopping the Servers

In each of the two terminals (backend and frontend) press:
```
Ctrl + C
```
and confirm with `Y` if prompted.

MongoDB will keep running in the background as a Windows service. That is fine —
you can leave it on.

---

## 15. Starting Again Later (After First-Time Setup)

You only do steps 1–8 once. The next time you want to run the project:

1. Open terminal in `backend/` → `npm run dev`
2. Open another terminal in `frontend/` → `npm start`
3. Browser → http://localhost:3000 → log in

That is the entire startup. The database keeps its data between runs.

If you want to reset the database back to clean demo data, run `node seed.js`
inside `backend/` again. It wipes and re-seeds in one second.

---

## 16. Troubleshooting

### "MongoServerError: connect ECONNREFUSED 127.0.0.1:27017"
MongoDB is not running. Start it:
- Windows: `Start-Service MongoDB` in an elevated PowerShell
- macOS:  `brew services start mongodb-community`

### "Error: listen EADDRINUSE: address already in use :::5000"
Another program is using port 5000. Find and kill it:
```
# Windows
netstat -ano | findstr :5000
taskkill /PID <pid> /F
```
Or change `PORT=5000` to `PORT=5001` in `backend/.env` and restart.

### Frontend shows "Network Error" after login
The backend died or wasn't started. Check the backend terminal — it should
still be printing sensor simulation logs. If it stopped, run `npm run dev`
again.

### Login fails with "Invalid credentials"
The database wasn't seeded. From `backend/` run:
```
node seed.js
```

### Live Monitor shows no updates
Socket.io failed to connect. Hard refresh the browser (Ctrl + Shift + R).
If still broken, restart the backend.

### `npm install` very slow or fails
Bad network or a corporate proxy. Try:
```
npm config set registry https://registry.npmjs.org/
npm install
```

### Browser doesn't open automatically
Just open http://localhost:3000 in any browser manually. The dev server
is already running.

---

## 17. Project Layout (Quick Reference)

```
mine-safety/
  backend/
    .env                 environment variables (MongoDB URL, JWT secret, port)
    package.json
    seed.js              one-time database seeding script
    server.js            Express app + Socket.io + sensor simulation loop
    models/              Mongoose schemas (User, Mine, Sensor, Alert, ...)
    routes/              REST endpoints grouped by resource
    middleware/auth.js   JWT verification used by protected routes
  frontend/
    package.json
    public/index.html
    src/
      App.js             routes + auth wrapper
      index.js           React entry point
      index.css          global styles
      api/index.js       axios + socket.io client setup
      context/           shared auth state
      components/        Layout (sidebar, ticker)
      pages/             one file per route (Dashboard, LiveMonitor, etc.)
  README.md              short project overview
  guide.md               this file
```

---

## 18. Notes for the Demo

- The backend simulates eight virtual sensors. Every 4 seconds it generates a
  fresh reading for each one, stores it in MongoDB, checks the value against
  safety thresholds, and broadcasts both the reading and any new alert to all
  connected browsers via Socket.io. There is no real IoT hardware involved.
- Sensor readings auto-delete from MongoDB after 24 hours (a TTL index on the
  collection) so the database does not grow forever.
- All passwords in the seed file are `password123` and are hashed with bcrypt
  before storage. The demo accounts are not real and have no privileges
  outside this project.
- JWT tokens expire after 7 days. If the dashboard suddenly logs you out
  after a long break, just sign in again.

Good luck with the demo From Chachu!.
