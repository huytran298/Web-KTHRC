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
    const createDeviceTable = `CREATE TABLE IF NOT EXISTS device (
        deviceID INTEGER PRIMARY KEY AUTOINCREMENT,
        deviceName TEXT NOT NULL,
        deviceType TEXT NOT NULL
    );`;

    db.run(createDeviceTable, (err) => {
        if (err) {
            console.error('Error creating device table:', err.message);
        } else {
            console.log('Device table created or already exists.');
        }
    });

    const insertDevice = `INSERT INTO device (deviceName, deviceType) VALUES
        ('Device A', 'Type 1'),
        ('Device B', 'Type 2'),
        ('Device C', 'Type 3'),
        ('Device 12', 'Type 4');`;

    db.run(insertDevice, (err) => {
        if (err) {
            console.error('Error inserting devices:', err.message);
        } else {
            console.log('Devices inserted successfully.');
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