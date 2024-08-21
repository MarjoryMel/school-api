const Professor = require('../models/professorModel');
const Course = require('../models/courseModel');
const User = require('../models/userModel');
const { professorCreationValidator, professorUpdateValidator } = require('../validators/professorValidator');
const { generateErrorMessages } = require('../utils/errorMessages');

// Create a new professor (only admins can)
exports.createProfessor = async (req, res) => {

    if (!req.user.isAdmin) {
        return res.status(403).json({ message: generateErrorMessages('ACCESS_DENIED') });
    }

    const { userId, firstName, lastName, courses, officeLocation } = req.body;

    // Validate the request body
    const { error } = professorCreationValidator.validate({ userId, firstName, lastName, courses, officeLocation });
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
        console.error('Error:', error.message);
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
        console.error('Error:', error.message);
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
        const { error } = professorUpdateValidator.validate(updates);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Check if the authenticated user is an admin or the professor themselves
        const isAdminOrSelf = req.user.isAdmin || req.user.userId.toString() === professor.userId.toString();
        if (isAdminOrSelf) {
            // Remove the professor from the old courses
            if (professor.courses && Array.isArray(professor.courses)) {
                for (const courseId of professor.courses) {
                    const course = await Course.findById(courseId);
                    if (course) {
                        // Remove the professor from the course's professors array
                        course.professors = course.professors.filter(professorId => !professorId.equals(professor._id));
                        await course.save();
                    }
                }
            }

            // Update professor details
            Object.keys(updates).forEach((key) => {
                professor[key] = updates[key];
            });

            // If the courses array is being updated
            if (updates.courses && Array.isArray(updates.courses)) {
                // Set the new list of courses
                professor.courses = updates.courses;

                // Add the professor to the new courses
                for (const courseId of professor.courses) {
                    const course = await Course.findById(courseId);
                    if (course) {
                        if (!course.professors.includes(professor._id)) {
                            course.professors.push(professor._id);
                            await course.save();
                        }
                    }
                }
            }

            await professor.save();
            return res.status(200).json({
                message: 'Professor updated successfully',
                professor: { id: professor._id, userId: professor.userId, firstName: professor.firstName, lastName: professor.lastName, courses: professor.courses, officeLocation: professor.officeLocation }
            });
        } else {
            return res.status(403).json({ message: generateErrorMessages('ACCESS_DENIED') });
        }
    } catch (error) {
        console.error('Error:', error.message);
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
        console.error('Error:', error.message);
        res.status(500).json({ error: generateErrorMessages('INTERNAL_ERROR') });
    }
};

// List all professors (accessible by any user)
exports.listProfessors = async (req, res) => {
    try {
        // Get pagination parameters from query
        const limit = parseInt(req.query.limit, 10);
        const page = parseInt(req.query.page, 10);

        // Validate limit and page
        const validLimits = [5, 10, 30];
        if (!validLimits.includes(limit)) {
            return res.status(400).json({ error: generateErrorMessages('INVALID_PAGE_LIMITE') });
        }
        if (page < 1 || isNaN(page)) {
            return res.status(400).json({ error: generateErrorMessages('INVALID_PAGE_PARAMETER') });
        }

        // Calculate the number of items to skip
        const skip = (page - 1) * limit;

        // Find professors with pagination and populate the courses field
        const professors = await Professor.find()
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'courses',
                select: 'title'
            });


        // Get total count for pagination information
        const totalProfessors = await Professor.countDocuments();
        const totalPages = Math.ceil(totalProfessors / limit);

        // Check if the requested page is valid
        if (page > totalPages) {
            return res.status(404).json({ error: generateErrorMessages('PAGE_NOT_FOUND') });
        }

        // Check if any professors are found
        if (professors.length === 0) {
            return res.status(404).json({ error: generateErrorMessages('PROFESSOR_NOT_REGISTRATION') });
        }

        // Respond with the list of professors
        return res.status(200).json({
            message: 'Professors retrieved successfully',
            totalProfessors,
            totalPages: Math.ceil(totalProfessors / limit),
            currentPage: page,
            professors: professors.map(professor => ({
                id: professor._id,
                userId: professor.userId,
                firstName: professor.firstName,
                lastName: professor.lastName,
                courses: professor.courses.map(course => ({
                    id: course._id,
                    title: course.title
                })),
                officeLocation: professor.officeLocation
            }))
        });
    } catch (error) {
        console.error('Error retrieving professors:', error.message);
        res.status(500).json({ message: `Error retrieving professors: ${error.message}` });
    }
};
