const Professor = require('../models/professorModel');
const Course = require('../models/courseModel');
const User = require('../models/userModel');
const { professorValidator } = require('../validators/professorValidator');
const { generateErrorMessages } = require('../utils/errorMessages');

// Create a new professor (only admins can)
exports.createProfessor = async (req, res) => {
    // Check if the authenticated user is an admin
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: generateErrorMessages('ACCESS_DENIED') });
    }

    const { userId, firstName, lastName, courses, officeLocation } = req.body;

    // Validate the request body
    const { error } = professorValidator.validate({ userId, firstName, lastName, courses, officeLocation });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        // Check if the user exists and is not already a professor
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: generateErrorMessages('USER_NOT_FOUND') });
        }

        const existingProfessor = await Professor.findOne({ userId });
        if (existingProfessor) {
            return res.status(400).json({ message: generateErrorMessages('PROFESSOR_ALREADY_EXISTS') });
        }

        // Create a new professor
        const newProfessor = new Professor({ userId, firstName, lastName, courses, officeLocation });

        await newProfessor.save();

        // Add the new professor to the specified courses
        if (courses && Array.isArray(courses)) {
            for (const courseId of courses) {
                const course = await Course.findById(courseId);
                if (course) {
                    if (!course.professors.includes(newProfessor._id)) {
                        course.professors.push(newProfessor._id);
                        await course.save();
                    }
                }
            }
        }

        res.status(201).json({
            message: 'Professor created successfully',
            professor: { id: newProfessor._id, userId: newProfessor.userId, firstName: newProfessor.firstName, lastName: newProfessor.lastName, courses: newProfessor.courses, officeLocation: newProfessor.officeLocation }
        });
    } catch (error) {
        res.status(500).json({ error: generateErrorMessages('INTERNAL_ERROR') });
    }
};

// Get professor details by ID
exports.getProfessor = async (req, res) => {
    const { id } = req.params;

    try {
        // Find professor by ID
        const professor = await Professor.findById(id);

        if (!professor) {
            return res.status(404).json({ message: generateErrorMessages('PROFESSOR_NOT_FOUND') });
        }

        res.status(200).json({
            professor: { id: professor._id, userId: professor.userId, firstName: professor.firstName, lastName: professor.lastName, courses: professor.courses, officeLocation: professor.officeLocation }
        });
    } catch (error) {
        res.status(500).json({ error: generateErrorMessages('INTERNAL_ERROR') });
    }
};

// Update professor details (only admins or the professor themselves can)
exports.updateProfessor = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        // Find the professor by ID
        const professor = await Professor.findById(id);
        if (!professor) {
            return res.status(404).json({ message: generateErrorMessages('PROFESSOR_NOT_FOUND') });
        }

        // Validate the request body
        const { error } = professorValidator.validate(updates);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Check if the authenticated user is an admin or the professor themselves
        const isAdminOrSelf = req.user.isAdmin || req.user.userId.toString() === professor.userId.toString();
        if (isAdminOrSelf) {
            // Update the professor details
            Object.keys(updates).forEach((key) => {
                professor[key] = updates[key];
            });

            await professor.save();

            return res.status(200).json({
                message: 'Professor updated successfully',
                professor: { id: professor._id, userId: professor.userId, firstName: professor.firstName, lastName: professor.lastName, courses: professor.courses, officeLocation: professor.officeLocation
                }
            });
        } else {
            return res.status(403).json({ message: generateErrorMessages('ACCESS_DENIED') });
        }
    } catch (error) {
        res.status(500).json({ error: generateErrorMessages('INTERNAL_ERROR') });
    }
};

// Delete a professor (only admins can)
exports.deleteProfessor = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the authenticated user is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: generateErrorMessages('ACCESS_DENIED') });
        }

        // Find and delete the professor by ID
        const professor = await Professor.findByIdAndDelete(id);
        if (!professor) {
            return res.status(404).json({ message: generateErrorMessages('PROFESSOR_NOT_FOUND') });
        }

        console.log('Professor deleted successfully:', professor);

        return res.status(200).json({
            message: 'Professor deleted successfully',
            professor: { id: professor._id,userId: professor.userId,firstName: professor.firstName,lastName: professor.lastName,courses: professor.courses,officeLocation: professor.officeLocation }
        });
    } catch (error) {
        res.status(500).json({ error: generateErrorMessages('INTERNAL_ERROR') });
    }
};

// List all professors (accessible by any user)
exports.listProfessors = async (req, res) => {
    try {
        // Retrieve all professors from the database
        const professors = await Professor.find();
        
        // Check if there are no professors
        if (professors.length === 0) {
            return res.status(404).json({ message: generateErrorMessages('NO_PROFESSORS_FOUND') });
        }

        // Respond with the list of professors
        return res.status(200).json({
            message: 'Professors retrieved successfully',
            professors: professors.map(professor => ({ id: professor._id,userId: professor.userId,firstName: professor.firstName,lastName: professor.lastName,courses: professor.courses, officeLocation: professor.officeLocation }))
        });
    } catch (error) {
        res.status(500).json({ error: generateErrorMessages('INTERNAL_ERROR') });
    }
};
