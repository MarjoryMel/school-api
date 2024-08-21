const express = require('express');
const router = express.Router();
const installController = require('../controls/installController');

router.get('/', installController.installDatabase);

module.exports = router;
