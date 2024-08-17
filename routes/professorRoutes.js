const express = require('express');
const router = express.Router();
const ProfessorController = require('../controls/professorController');
const authMiddleware = require('../utils/middlewares');

router.post('/create', authMiddleware, ProfessorController.createProfessor); // Route to create a new teacher
router.get('/:id', authMiddleware, ProfessorController.getProfessor);

module.exports = router;
