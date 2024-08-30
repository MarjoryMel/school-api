const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/studentController'); 
const { authMiddleware, checkAdmin } = require('../utils/middlewares');

router.post('/', authMiddleware, checkAdmin, StudentController.createStudent);                    // Route to create a new student
router.get('/list', StudentController.listStudents);                                              // Route to list students
router.get('/:enrollmentNumber', authMiddleware, StudentController.getStudent);                   // Route to pick up a student
router.put('/:enrollmentNumber', authMiddleware, StudentController.updateStudent);                // Route to upgrade a student
router.delete('/:enrollmentNumber', authMiddleware, checkAdmin, StudentController.deleteStudent); // Route to delete a student

module.exports = router;
