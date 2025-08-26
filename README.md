# Device Records API

A simple RESTful API to manage devices and their records using SQLite. This API allows you to create, read, update, and delete device details and records.

---

## Features

- **Device Management**: Add, fetch, and delete devices.
- **Record Management**: Add, fetch, and delete records associated with devices.
- **SQLite Database**: A lightweight database that store all data in local file that can be easily managed. 

---

## Endpoints

### Device Management

- **Create a device**
  - `POST /device`
  - Request body: `{ "deviceName": "string", "deviceType": "string" }`
  - The deviceID attribute is `AUTO INCREMENT` by integer so you don't need to consider it but you may have to look it up on the database ID for the record if you want to use the ID attribute.
  - But the deviceName is an `UNIQUE` attribute so use whatever ID you may have on hand.
  
- **Get all devices**
  - `GET /device?deviceID=**string**&deviceName:**string**&deviceType:**string**`
  - You can use the filter to get the desired device
  - Return a json object that contains attributes in this format: 
  - `{ "deviceID" : "integer", "deviceName": "string", "deviceType": "string" }`
  
- **Delete a device**
  - `DELETE /device/:deviceID`

### Record Management

- **Create a record**
  - `POST /record`
  - Request body: `{ "deviceID": "integer", "timeStamp": "dateTime", "Cps": "fractional number", "uSv": "fractinal number" }`
  - timeStamp can be anything you may see fit, recommend UNIX timestamp for better accuracy. 
  
- **Get all records**
  - return format: `{ "deviceID": "integer", "timeStamp": "dateTime", "Cps": "fractional number", "uSv": "fractinal number" }`
  - Get all the record with filter.
  - `GET /record?deviceID=**string**&day=**int**&month=**int**&year=**int**&Cps=**real**&uSv:**real**`

- **Get all record within a date range**
  - Work in progress...
  
- **Delete a record**
  - `DELETE /record/:deviceID/:timeStamp`
  - `DELETE /record/:deviceID?deviceID=**string**&day=**int**&month=**int**&year=**int**`
  - deviceID (must have)
  - year (must have)
  - day (optional)
  - month (optional)

---

## Installation

1. Clone the repository:
    - This is private, get wherever you see fit. 

2. Install dependencies:
   ```bash
   cd device-records-api
   npm install
   ```

3. Start the server:
   ```bash
   node index.js
   ```
   OR 
   ```bash
   npm start
   ```

4. Test the server: 
    - Un-comment and comment the required text line in the `src/databaseInit.js` file

   ```bash
   npm test
   ```

   - more testing work in progress...
    

Server will run on `http://localhost:5000`.

---

## Dependencies

- `express`: server-side web framework for Node.js.
- `sqlite3`: SQLite database library for Node.js.
- `body-parser`: Middleware to parse JSON request bodies.
- `jest`: testing framework
- `supertest`: https api testing methods

---

