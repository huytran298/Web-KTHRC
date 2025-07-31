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

    // Proxy /device requests
    app.get('/device', cors(corsOptions), async (req, res) => {
        if (process.env.NODE_ENV === 'production') {
            try {
                const apiRes = await fetch('http://localhost:5000/device');  // avoid circular HTTPS loop
                if (!apiRes.ok) {
                    return res.status(apiRes.status).json({ error: 'Upstream error', status: apiRes.status, statusText: apiRes.statusText });
                }
                const data = await apiRes.json();
                res.setHeader('Access-Control-Allow-Origin', 'https://rabbitcave.com.vn');
                res.json(data);
            } catch (err) {
                res.status(500).json({ error: 'Proxy error', details: err.message });
            }
        } else {
            res.setHeader('Access-Control-Allow-Origin', 'https://rabbitcave.com.vn');
            res.json([
                {
                    id: 'dev001',
                    name: 'Geiger Counter',
                    type: 'Radiation Detector',
                    status: 'active',
                    cps: 123,
                    lastUpdated: new Date().toISOString()
                },
                {
                    id: 'dev002',
                    name: 'MPPC',
                    type: 'Photon Counter',
                    status: 'inactive',
                    cps: 0,
                    lastUpdated: new Date().toISOString()
                }
            ]);
        }
    });

    // Proxy /record requests
    app.get('/record', cors(corsOptions), async (req, res) => {
        const params = new URLSearchParams(req.query).toString();
        try {
            const apiRes = await fetch(`http://localhost:5000/record?${params}`);
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
