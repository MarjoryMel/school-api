const express = require('express');
const router = express.Router();
const CourseController = require('../controllers/courseController'); 
const { authMiddleware, checkAdmin } = require('../utils/middlewares');

router.post('/', authMiddleware, checkAdmin, CourseController.createCourse);       // Route to create a new course
router.get('/list', CourseController.listCourses);                                 // Route to list courses
router.get('/:id', CourseController.getCourse);                                    // Route to search for a course
router.put('/:id', authMiddleware, checkAdmin, CourseController.updateCourse);     // Route to update a course
router.delete('/:id', authMiddleware, checkAdmin, CourseController.deleteCourse);  // Route to delete a course
router.get('/summary/info-course', CourseController.getCourseSummary);             // Special route

module.exports = router;
