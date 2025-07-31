// ...existing code...
const express = require('express');
const cors = require('cors');

let fetch;

import('node-fetch').then(mod => {
    fetch = mod.default;

    const app = express();

    // Only allow requests from your frontend domain
    app.use(cors({
        origin: 'https://rabbitcave.com.vn',
        credentials: true
    }));

    // Serve static files (HTML, JS, etc.)
    app.use(express.static(__dirname));

    // CORS middleware for individual routes (optional)
    const corsOptions = {
        origin: 'https://rabbitcave.com.vn',
        credentials: true
    };

    // Proxy /device-data requests (fetch all device records)
    // Proxy /device requests
    app.get('/device', cors(corsOptions), async (req, res) => {
        try {
            const apiRes = await fetch('https://api.rabbitcave.com.vn/device');
            if (!apiRes.ok) {
                return res.status(apiRes.status).json({ error: 'Upstream error', status: apiRes.status, statusText: apiRes.statusText });
            }
            const data = await apiRes.json();
            res.setHeader('Access-Control-Allow-Origin', 'https://rabbitcave.com.vn');
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: 'Proxy error', details: err.message });
        }
    });

    // Proxy /record requests
    app.get('/record', cors(corsOptions), async (req, res) => {
        const params = new URLSearchParams(req.query).toString();
        try {
            const apiRes = await fetch(`https://api.rabbitcave.com.vn/record?${params}`);
            if (!apiRes.ok) {
                return res.status(apiRes.status).json({ error: 'Upstream error', status: apiRes.status, statusText: apiRes.statusText });
            }
            const data = await apiRes.json();
            res.setHeader('Access-Control-Allow-Origin', 'https://rabbitcave.com.vn');
            res.json(data);
        } catch (err) {
            res.status(500).json({ error: 'Proxy error', details: err.message });
        }
    });

    // Proxy /device-data requests (fetch all device records)
    app.get('/device-data', cors(corsOptions), async (req, res) => {
        const params = new URLSearchParams(req.query).toString();
        try {
            const apiRes = await fetch(`https://api.rabbitcave.com.vn/record?${params}`);
            if (!apiRes.ok) {
                return res.status(apiRes.status).json({ error: 'Upstream error', status: apiRes.status, statusText: apiRes.statusText });
            }
            const data = await apiRes.json();
            res.setHeader('Access-Control-Allow-Origin', 'https://rabbitcave.com.vn');
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
