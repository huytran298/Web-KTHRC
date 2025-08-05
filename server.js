
let fetch;

import('node-fetch').then(mod => {
    fetch = mod.default;
    const express = require('express');
    const cors = require('cors');


    const app = express();

    // ✅ Add this line to parse incoming JSON data
    app.use(express.json());

    // Allow requests from your frontend domain and local dev
    const allowedOrigins = [
        'https://rabbitcave.com.vn',
        'http://localhost:5000',
        'http://127.0.0.1:5000'
    ];
    app.use(cors({
        origin: function(origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                return callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true
    }));

    // Serve static files (HTML, JS, etc.)
    app.use(express.static(__dirname));

    const corsOptions = {
        origin: function(origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                return callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true
    };

    app.get('/device-data', cors(corsOptions), async (req, res) => {
        const params = new URLSearchParams(req.query).toString();
        try {
            const apiRes = await fetch(`https://api.rabbitcave.com.vn/record?${params}`);
            if (!apiRes.ok) {
                return res.status(apiRes.status).json({
                    error: 'Upstream error',
                    status: apiRes.status,
                    statusText: apiRes.statusText
                });
            }
            const data = await apiRes.json();
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: 'Proxy error', details: err.message });
        }
    });

    app.get('/device', cors(corsOptions), async (req, res) => {
        try {
            const apiRes = await fetch('https://api.rabbitcave.com.vn/device');
            if (!apiRes.ok) {
                return res.status(apiRes.status).json({
                    error: 'Upstream error',
                    status: apiRes.status,
                    statusText: apiRes.statusText
                });
            }
            const data = await apiRes.json();
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: 'Proxy error', details: err.message });
        }
    });

    // ✅ Now this will correctly log incoming JSON from ESP32
    app.post("/record", (req, res) => {
        console.log(req.body);
        res.status(200).send("OK");
    });

    let latestDeviceData = null;    

    const history = [];

    // index.js
// At the top of your file (already present)
    require('dotenv').config();
    const mysql = require('mysql2/promise');
    const bodyParser = require('body-parser');

    app.use(bodyParser.json());

    const pool = mysql.createPool({
    host:     'localhost',
    port:     3306,
    user:     'your_mysql_user',
    password: 'your_mysql_pass',
    database: 'your_database',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
    });

    // 1) POST incoming payload to /testconnection and save to MySQL
    app.post('/testconnection', async (req, res) => {
    const { data, receivedAt } = req.body;
    if (!data || !data.deviceID || !data.timeStamp || !data.Cps || data.uSv === undefined) {
        return res.status(400).json({ error: 'Malformed payload' });
    }

    try {
        const sql = `INSERT INTO records
        (deviceID, timeStamp, Cps, uSv, receivedAt)
        VALUES (?, ?, ?, ?, ?)`;
        const params = [
        data.deviceID,
        parseInt(data.timeStamp, 10),
        parseInt(data.Cps, 10),
        parseFloat(data.uSv),
        receivedAt ? new Date(receivedAt) : new Date()
        ];
        await pool.execute(sql, params);
        res.json({ status: 'ok' });
    } catch (err) {
        console.error('DB insert error:', err);
        res.status(500).json({ error: 'Database error' });
    }
    });

    // 2) GET all records (optionally filtered by deviceID)
    app.get('/records', async (req, res) => {
    const { deviceID, startTime, endTime } = req.query;
    let sql = 'SELECT * FROM records';
    const where = [];
    const params = [];

    if (deviceID) {
        where.push('deviceID = ?');
        params.push(deviceID);
    }
    if (startTime) {
        where.push('timeStamp >= ?');
        params.push(parseInt(startTime, 10));
    }
    if (endTime) {
        where.push('timeStamp <= ?');
        params.push(parseInt(endTime, 10));
    }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY timeStamp ASC';

    try {
        const [rows] = await pool.execute(sql, params);
        res.json(rows);
    } catch (err) {
        console.error('DB query error:', err);
        res.status(500).json({ error: 'Database error' });
    }
    });

    // 3) GET distinct device list
    app.get('/devices', async (_req, res) => {
    try {
        const [rows] = await pool.execute(
        'SELECT DISTINCT deviceID FROM records ORDER BY deviceID'
        );
        res.json(rows.map(r => r.deviceID));
    } catch (err) {
        console.error('DB query error:', err);
        res.status(500).json({ error: 'Database error' });
    }
    });



    app.get('/record', cors(corsOptions), async (req, res) => {
        console.log('Received GET /record request', req.query);
        const params = new URLSearchParams(req.query).toString();
        try {
            const apiRes = await fetch(`https://api.rabbitcave.com.vn/record?${params}`);
            if (!apiRes.ok) {
                return res.status(apiRes.status).json({
                    error: 'Upstream error', 
                    status: apiRes.status,
                    statusText: apiRes.statusText
                });
            }
            const data = await apiRes.json();
            res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
            res.json(data);
        } catch (err) {
            console.error("Error fetching records:", err);
            res.status(500).json({ error: 'Proxy error', details: err.message });
        }
    });

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Static files served from:', __dirname);
        });
    });

