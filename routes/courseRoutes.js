const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/courseController'); 
const authMiddleware = require('../utils/middlewares'); 

router.post('/', authMiddleware, CourseController.createCourse);       // Route to create a new course
router.get('/:id', CourseController.getCourse);                        // Route to search for a course
router.put('/:id', authMiddleware, CourseController.updateCourse);     // Route to update a course
router.delete('/:id', authMiddleware, CourseController.deleteCourse);  // Route to delete a course
router.get('/list', CourseController.listCourses);                         // Route to list courses
router.get('/summary/info-course', CourseController.getCourseSummary); // Special route

module.exports = router;
