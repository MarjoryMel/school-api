const Course = require('../models/courseModel');
const User = require('../models/userModel');
const { courseSchema } = require('../validators/courseValidator');

// Create a new course (only admins can)
exports.createCourse = async (req, res) => {
    const { title, department, professors } = req.body;

    // Validate the course data
    const { error } = courseSchema.validate({ title, department, professors });
    if (error) {
        return res.status(400).json({ errors: error.details });
    }

    try {
        // Check if the authenticated user is an admin
        if (!req.user.isAdmin) {
            console.log('Access denied. User is not an admin.');
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        // Create a new course
        const newCourse = new Course({
            title,
            department,
            professors // Ensure this is an array of ObjectIds or empty array
        });

        await newCourse.save();
        console.log('Course created successfully:', newCourse);

        res.status(201).json({
            message: 'Course created successfully',
            course: {
                id: newCourse._id,
                title: newCourse.title,
                department: newCourse.department,
                professors: newCourse.professors
            }
        });
    } catch (error) {
        console.error('Error creating course:', error.message);
        res.status(500).json({ error: error.message });
    }
};
