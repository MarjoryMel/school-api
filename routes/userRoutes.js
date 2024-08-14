const express = require('express');
const router = express.Router();
const UserController = require('../controls/userController');
const authMiddleware = require('../utils/middlewares');

router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.post('/admin', authMiddleware, UserController.createAdmin);


module.exports = router;
