const app = require('./server');
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Listen on all interfaces for production

// Global error handlers to avoid silent crashes
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection at:', reason);
});

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
    console.log('Shutting down...');
    app.close(() => process.exit(0));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);