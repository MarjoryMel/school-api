const Course = require('../models/courseModel');
const User = require('../models/userModel');
const { courseValidator } = require('../validators/courseValidator');
const { generateErrorMessages } = require('../utils/errorMessages');

// Create a new course (only admins can)
exports.createCourse = async (req, res) => {
    const { title, department, professors } = req.body;

    // Validate the course data
    const { error } = courseValidator.validate({ title, department, professors });
    if (error) {
        return res.status(400).json({ message: generateErrorMessages('VALIDATION_ERROR') });
    }

    try {
        // Check if the authenticated user is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: generateErrorMessages('ACCESS_DENIED') });
        }

        // Create a new course
        const newCourse = new Course({ title, department,professors});

        await newCourse.save();
        console.log('Course created successfully:', newCourse);

        res.status(201).json({
            message: 'Course created successfully',
            course: { id: newCourse._id, title: newCourse.title, department: newCourse.department, professors: newCourse.professors}
        });
    } catch (error) {
        console.error('Error creating course:', error.message);
        res.status(500).json({ message: generateErrorMessages('INTERNAL_ERROR') });
    }
};
