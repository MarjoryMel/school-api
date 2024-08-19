const express = require('express');
const router = express.Router();
const StudentController = require('../controls/studentController'); 
const authMiddleware = require('../utils/middlewares'); 

router.post('/', authMiddleware, StudentController.createStudent);                    // Route to create a new student
router.get('/:enrollmentNumber', authMiddleware, StudentController.getStudent);       // Route to pick up a student
router.put('/:enrollmentNumber', authMiddleware, StudentController.updateStudent);    // Route to upgrade a student
router.delete('/:id', authMiddleware, StudentController.deleteStudent);               // Route to delete a student
router.get('/', StudentController.listStudents);                                      // Route to list students



module.exports = router;
