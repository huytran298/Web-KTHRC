const express = require('express');
const cors = require('cors');

let fetch;

import('node-fetch').then(mod => {
    fetch = mod.default;

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

    app.get('/record', cors(corsOptions), async (req, res) => {
        console.log('Received /record request', req.query);
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

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log('Static files served from:', __dirname);
    });
});
