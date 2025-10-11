const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');

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

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src', 'public')));

// Routes
const mainRoute = require("./src/router/indexRouter");
mainRoute(app);

// Create HTTP server
const server = http.createServer(app);

// Health check endpoint
app.get('/health', (req, res) => {
	res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Export an app-like object with listen/close so index.js can call app.listen()
module.exports = {
	listen: (port, cb) => server.listen(port, cb),
	close: (cb) => server.close(cb),
	server,
};
