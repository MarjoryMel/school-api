const express = require('express');
const router = express.Router();
const UserController = require('../controls/userController');
const authMiddleware = require('../utils/middlewares');

router.post('/register', UserController.registerUser);                    // Route to register a new user
router.post('/login', UserController.loginUser);                          // Route to log in a user
router.post('/admin', authMiddleware, UserController.createAdmin);        // Route to create a new admin user
router.delete('/delete/:id', authMiddleware, UserController.deleteUser);  // Route to delete users
router.put('/update/:id', authMiddleware, UserController.updateUser);     // Route to update user data

module.exports = router;
