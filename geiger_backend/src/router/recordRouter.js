const express = require('express');

const recordController = require('../modules/recordController');

const router = express.Router();

router.post('/record', recordController.createRecord)

router.get('/record', recordController.getRecords)

router.get('/record/:deviceID', recordController.getRecordsByID)

router.delete('/record/:deviceID/:timeStamp', recordController.deleteRecordByIDTimeStamp)

module.exports = router;

