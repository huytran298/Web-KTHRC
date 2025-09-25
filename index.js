const app = require('./server');
const PORT = process.env.PORT || 5000;

// Global error handlers to avoid silent crashes
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection at:', reason);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
    console.log('Shutting down...');
    app.close(() => process.exit(0));
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);