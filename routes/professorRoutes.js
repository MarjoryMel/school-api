const express = require('express');
const router = express.Router();
const ProfessorController = require('../controllers/professorController');
const authMiddleware = require('../utils/middlewares');

router.post('/', authMiddleware, ProfessorController.createProfessor);       // Route to create a new teacher
router.get('/:id', authMiddleware, ProfessorController.getProfessor);        // Route to find a teacher
router.put('/:id', authMiddleware, ProfessorController.updateProfessor);     // Route to update a teacher's information
router.delete('/:id', authMiddleware, ProfessorController.deleteProfessor);  // Route to delete a professor
router.get('/list', ProfessorController.listProfessors);                         // Route to list all professors

module.exports = router;
