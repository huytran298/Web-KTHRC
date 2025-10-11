const sqlite = require('sqlite3');

// TODO: fix all the insert in the device because all deviceID is auto increase

module.exports.createDBconnection = (filePath) => {
    // uncomment memory to test
    const db = new sqlite.Database(filePath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });

    db.serialize(() => {
        db.run(`
        CREATE TABLE IF NOT EXISTS device (
          deviceID INTEGER PRIMARY KEY AUTOINCREMENT,
          deviceName TEXT UNIQUE,
          deviceType TEXT
        )
      `);
        db.run(`
        CREATE TABLE IF NOT EXISTS record (
          deviceID INTEGER,
          timeStamp DATETIME,
          Cps REAL,
          uSv REAL,
          PRIMARY KEY (deviceID, timeStamp),
          FOREIGN KEY (deviceID) REFERENCES device(deviceID)
        )
      `);
    });

    return db;
};

// Test functions to verify database functionality
if (require.main === module) {
    const db = module.exports.createDBconnection(':memory:');

    // Test creating a device
    db.run(`INSERT INTO device (deviceName, deviceType) VALUES (?, ?)`, ['Device1', 'TypeA'], function(err) {
        if (err) {
            return console.error('Error inserting device:', err.message);
        }
        console.log('Device inserted with ID:', this.lastID);
    });

    // Test retrieving devices
    db.all(`SELECT * FROM device`, [], (err, rows) => {
        if (err) {
            return console.error('Error retrieving devices:', err.message);
        }
        console.log('Devices:', rows);
    });

    // Test creating a record
    db.run(`INSERT INTO record (deviceID, timeStamp, Cps, uSv) VALUES (?, ?, ?, ?)`, [1, new Date().toISOString(), 100.5, 0.25], function(err) {
        if (err) {
            return console.error('Error inserting record:', err.message);
        }
        console.log('Record inserted with row ID:', this.lastID);
    });

    // Test retrieving records
    db.all(`SELECT * FROM record`, [], (err, rows) => {
        if (err) {
            return console.error('Error retrieving records:', err.message);
        }
        console.log('Records:', rows);
    });

    // Close the database connection
    db.close((err) => {
        if (err) {
            return console.error('Error closing database:', err.message);
        }
        console.log('Database connection closed.');
    });
}
