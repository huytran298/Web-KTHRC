const http = require('http');
const fs = require('fs');
const path = require('path');

// Serve static files from project root
const root = path.resolve(__dirname);

function contentTypeFor(ext) {
	switch (ext) {
		case '.html': return 'text/html; charset=utf-8';
		case '.css': return 'text/css; charset=utf-8';
		case '.js': return 'application/javascript; charset=utf-8';
		case '.json': return 'application/json; charset=utf-8';
		case '.png': return 'image/png';
		case '.jpg':
		case '.jpeg': return 'image/jpeg';
		case '.svg': return 'image/svg+xml';
		case '.ico': return 'image/x-icon';
		case '.mp4': return 'video/mp4';
		default: return 'application/octet-stream';
	}
}

const server = http.createServer((req, res) => {
	try {
		const urlPath = decodeURI(req.url.split('?')[0] || '/');

		// Health check for Cloudflare / monitoring
		if (urlPath === '/health' || urlPath === '/_/health') {
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
			return;
		}

		// Default to index.html for root
		let relPath = urlPath === '/' ? '/index.html' : urlPath;

		// Prevent path traversal
		const safePath = path.normalize(relPath).replace(/^\.+/, '');
		const filePath = path.join(root, safePath);

		fs.stat(filePath, (err, stats) => {
			if (err || !stats.isFile()) {
				// If not found, respond 404 (don't try to serve directories)
				res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
				res.end('Not found');
				return;
			}

			const ext = path.extname(filePath).toLowerCase();
			const contentType = contentTypeFor(ext);
			res.writeHead(200, { 'Content-Type': contentType });
			const stream = fs.createReadStream(filePath);
			stream.pipe(res);
			stream.on('error', () => {
				res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
				res.end('Server error');
			});
		});
	} catch (ex) {
		console.error('Request handler error', ex);
		try {
			res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
			res.end('Server error');
		} catch (_) {}
	}
});

// Export an app-like object with listen/close so index.js can call app.listen()
module.exports = {
	listen: (port, cb) => server.listen(port, cb),
	close: (cb) => server.close(cb),
	server,
};
