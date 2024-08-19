const express = require('express');
const router = express.Router();
const CourseController = require('../controls/courseController'); 
const authMiddleware = require('../utils/middlewares'); 

router.post('/', authMiddleware, CourseController.createCourse); // Route to create a new course
router.get('/:id', CourseController.getCourse);                  // Route to search for a course

module.exports = router;
