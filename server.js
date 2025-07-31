const express = require('express');
const cors = require('cors');
// Only declare fetch once
// Delay server start until node-fetch is loaded
let fetch;
import('node-fetch').then(mod => {
    fetch = mod.default;

    const app = express();

    // Enable CORS for all routes
    app.use(cors());

    // Serve static files (HTML, CSS, JS, images, fonts)
    app.use(express.static(__dirname));

    // Proxy /device requests
    app.get('/device', async (req, res) => {
        if (process.env.NODE_ENV === 'production') {
            // Use real API in production
            try {
                const apiRes = await fetch('https://api.rabbitcave.com.vn/device');
                if (!apiRes.ok) {
                    return res.status(apiRes.status).json({ error: 'Upstream error', status: apiRes.status, statusText: apiRes.statusText });
                }
                let data;
                try {
                    data = await apiRes.json();
                } catch (jsonErr) {
                    return res.status(502).json({ error: 'Invalid JSON from upstream', details: jsonErr.message });
                }
                res.json(data);
            } catch (err) {
                res.status(500).json({ error: 'Proxy error', details: err.message });
            }
        } else {
            // Mock device data for development
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
    app.get('/record', async (req, res) => {
        const params = new URLSearchParams(req.query).toString();
        try {
            const apiRes = await fetch(`https://api.rabbitcave.com.vn/record?${params}`);
            if (!apiRes.ok) {
                return res.status(apiRes.status).json({ error: 'Upstream error', status: apiRes.status, statusText: apiRes.statusText });
            }
            let data;
            try {
                data = await apiRes.json();
            } catch (jsonErr) {
                return res.status(502).json({ error: 'Invalid JSON from upstream', details: jsonErr.message });
            }
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

