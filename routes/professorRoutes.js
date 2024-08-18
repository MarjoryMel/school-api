const express = require('express');
const router = express.Router();
const ProfessorController = require('../controls/professorController');
const authMiddleware = require('../utils/middlewares');

router.post('/create', authMiddleware, ProfessorController.createProfessor); // Route to create a new teacher
router.get('/:id', authMiddleware, ProfessorController.getProfessor);        // Route to find a teacher
router.put('/:id', authMiddleware, ProfessorController.updateProfessor);     // Route to update a teacher's information
router.delete('/:id', authMiddleware, ProfessorController.deleteProfessor);  // Route to delete a professor

module.exports = router;
