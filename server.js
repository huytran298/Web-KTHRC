// server.js
import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// —— boilerplate to get __dirname in ES module:
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();
app.use(express.json());

const allowedOrigins = [
  'https://rabbitcave.com.vn',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// serve your static frontend:
app.use(express.static(__dirname));

// ——— SQLite setup ———
const db = new Database(path.join(__dirname, 'data', 'records.db'));

// ensure `data/` exists and schema is ready:
db.exec(`
  CREATE TABLE IF NOT EXISTS records (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    deviceID    TEXT    NOT NULL,
    timeStamp   INTEGER NOT NULL,
    Cps         INTEGER NOT NULL,
    uSv         REAL    NOT NULL,
    receivedAt  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_device ON records(deviceID);
  CREATE INDEX IF NOT EXISTS idx_time   ON records(timeStamp);
`);

const insertStmt = db.prepare(`
  INSERT INTO records (deviceID, timeStamp, Cps, uSv, receivedAt)
  VALUES (@deviceID, @timeStamp, @Cps, @uSv, @receivedAt)
`);
const selectAllStmt = db.prepare(`
  SELECT * FROM records
  /**where**/
  ORDER BY timeStamp ASC
`);
const selectDistinctDevicesStmt = db.prepare(`
  SELECT DISTINCT deviceID FROM records
  ORDER BY deviceID
`);

// ——— Endpoints ———

// 1) Write incoming testconnection payload into SQLite
app.post('/testconnection', (req, res) => {
  const { data, receivedAt } = req.body;
  if (!data?.deviceID || data.timeStamp == null || data.Cps == null || data.uSv == null) {
    return res.status(400).json({ error: 'Malformed payload' });
  }
  try {
    insertStmt.run({
      deviceID:   data.deviceID.toString(),
      timeStamp:  parseInt(data.timeStamp, 10),
      Cps:        parseInt(data.Cps, 10),
      uSv:        parseFloat(data.uSv),
      receivedAt: receivedAt ? new Date(receivedAt).toISOString() : new Date().toISOString()
    });
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('SQLite insert error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 2) GET /records?deviceID=&startTime=&endTime=
app.get('/records', (req, res) => {
  const { deviceID, startTime, endTime } = req.query;
  let whereClauses = [];
  let params = {};

  if (deviceID) {
    whereClauses.push('deviceID = @deviceID');
    params.deviceID = deviceID;
  }
  if (startTime) {
    whereClauses.push('timeStamp >= @startTime');
    params.startTime = parseInt(startTime, 10);
  }
  if (endTime) {
    whereClauses.push('timeStamp <= @endTime');
    params.endTime = parseInt(endTime, 10);
  }

  // inject WHERE if needed
  const sql = selectAllStmt.source.replace(
    '/**where**/',
    whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : ''
  );

  try {
    const stmt = db.prepare(sql);
    const rows = stmt.all(params);
    res.json(rows);
  } catch (err) {
    console.error('SQLite query error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// 3) GET /devices
app.get('/devices', (_req, res) => {
  try {
    const rows = selectDistinctDevicesStmt.all();
    // return bare array of IDs:
    res.json(rows.map(r => r.deviceID));
  } catch (err) {
    console.error('SQLite query error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// fall-through to proxy others, static etc.
// ... (your existing `/device`, `/record` proxy handlers) ...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
