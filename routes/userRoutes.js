const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authMiddleware, checkAdmin } = require('../utils/middlewares');

router.post('/', UserController.registerUser);                                  // Route to register a new user
router.get('/list', authMiddleware, UserController.listUsers);                  // Route to list all users
router.put('/:id', authMiddleware, UserController.updateUser);                  // Route to update user data
router.delete('/:id', authMiddleware, checkAdmin, UserController.deleteUser);   // Route to delete users
router.post('/login', UserController.loginUser);                                // Route to log in a user
router.post('/admin', authMiddleware, checkAdmin, UserController.createAdmin);  // Route to create a new admin user

module.exports = router;
