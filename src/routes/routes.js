const express = require("express");

const router = express.Router()
const configController = require('../server/config/configController.js');
const fileController = require('../server/files/fileController.js')

// config module
router.post('/saveConfig', configController.saveConfig);
router.get('/monitor',configController.monitor);

// createFile
router.post('/createDir',fileController.createFile);

module.exports = router;
