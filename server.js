const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { createDBconnection } = require('./src/modules/database');

const app = express();
const root = path.resolve(__dirname);

// Session configuration
app.use(session({
	secret: 'your_secret_key',
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 1000 * 60 * 60 * 24, // 1 day
	}
}));

// Enable CORS
app.use(cors());

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname))); // Serve static files from the root directory

// Database connection
const db = createDBconnection(path.join(__dirname, 'database', 'geiger.db'));

// Routes
const mainRoute = require("./src/router/indexRouter");
mainRoute(app);

// Create HTTP server
const server = http.createServer(app);

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Device endpoint
app.get('/device', (req, res) => {
    db.all('SELECT * FROM device', [], (err, rows) => {
        if (err) {
            console.error('Error fetching devices:', err);
            return res.status(500).json({ error: 'Failed to fetch devices' });
        }

        if (rows.length === 0) {
            return res.status(200).json({
                message: 'No devices available',
                devices: []
            });
        }

        res.status(200).json({
            message: 'Devices retrieved successfully',
            devices: rows
        });
    });
});

// Export an app-like object with listen/close so index.js can call app.listen()
// at the end of server.js
module.exports = {
  app, // Express app (optional, helpful)
  server,
  // support (port, hostname, callback) or (port, callback)
  listen: (port, hostnameOrCb, cb) => {
    if (typeof hostnameOrCb === 'function') {
      // called as listen(port, callback)
      return server.listen(port, hostnameOrCb);
    } else {
      // called as listen(port, hostname, callback)
      return server.listen(port, hostnameOrCb, cb);
    }
  },
  close: (cb) => server.close(cb),
};
