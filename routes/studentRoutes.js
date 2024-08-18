const express = require('express');
const router = express.Router();
const StudentController = require('../controls/studentController'); 
const authMiddleware = require('../utils/middlewares'); 

router.post('/create', authMiddleware, StudentController.createStudent); // Route to create a new student

module.exports = router;
