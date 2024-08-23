const express = require('express');
const router = express.Router();
const installController = require('../controllers/installController');

router.get('/', installController.installDatabase);    // Route to install data in the database

module.exports = router;
