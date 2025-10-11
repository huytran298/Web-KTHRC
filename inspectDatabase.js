const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'geiger.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error('Error connecting to database:', err.message);
    }
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table';", [], (err, tables) => {
        if (err) {
            console.error('Error fetching tables:', err.message);
        } else {
            console.log('Tables:', tables);
        }
    });

    db.all("SELECT * FROM device;", [], (err, rows) => {
        if (err) {
            console.error('Error fetching devices:', err.message);
        } else {
            console.log('Devices:', rows);
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('Error closing the database connection:', err.message);
    } else {
        console.log('Database connection closed.');
    }
});