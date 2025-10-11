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

    for (let i = 1; i <= 12; i++) {
        const deviceName = `Device ${i}`;
        const deviceType = `Type ${Math.ceil(i / 3)}`; // Assign a type based on the device ID
        const insertDevice = `INSERT INTO device (deviceID, deviceName, deviceType) VALUES
            (${i}, '${deviceName}', '${deviceType}')`;

        db.run(insertDevice, (err) => {
            if (err) {
                console.error(`Error inserting device with ID ${i}:`, err.message);
            } else {
                console.log(`Device with ID ${i} inserted successfully.`);
            }
        });
    }
});

db.close((err) => {
    if (err) {
        console.error('Error closing the database connection:', err.message);
    } else {
        console.log('Database connection closed.');
    }
});