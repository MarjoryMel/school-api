const express = require('express');
const router = express.Router();
const UserController = require('../controls/userController');
const authMiddleware = require('../utils/middlewares');

router.post('/', UserController.registerUser);                      // Route to register a new user
router.put('/:id', authMiddleware, UserController.updateUser);      // Route to update user data
router.delete('/:id', authMiddleware, UserController.deleteUser);   // Route to delete users
router.post('/login', UserController.loginUser);                    // Route to log in a user
router.post('/admin', authMiddleware, UserController.createAdmin);  // Route to create a new admin user
router.get('/', authMiddleware, UserController.listUsers);

module.exports = router;
