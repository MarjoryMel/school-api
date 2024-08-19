const express = require('express');
const router = express.Router();
const CourseController = require('../controls/courseController'); 
const authMiddleware = require('../utils/middlewares'); 

router.post('/', authMiddleware, CourseController.createCourse); // Route to create a new course

module.exports = router;
