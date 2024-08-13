const express = require('express');
const router = express.Router();
const UserController = require('../controls/userController');

router.post('/register', UserController.registerUser);

module.exports = router;
