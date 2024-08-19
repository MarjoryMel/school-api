const { generateEnrollmentNumber } = require('../utils/support');
const { studentValidator } = require('../validators/studentValidator');
const Student = require('../models/studentModel');

// Function to create a new student (only admins can)
exports.createStudent = async (req, res) => {
    // Check if the authenticated user is an admin
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    const { userId, firstName, lastName, courses, dateOfBirth } = req.body;

    // Validate the request body
    const { error } = studentValidator.validate({ userId, firstName, lastName, courses, dateOfBirth });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        // Generate a new enrollment number
        const enrollmentNumber = generateEnrollmentNumber();

        // Create a new student
        const newStudent = new Student({
            userId,
            firstName,
            lastName,
            enrollmentNumber, 
            courses,
            dateOfBirth
        });

        // Save the student to the database
        await newStudent.save();

        // Respond with the newly created student data
        res.status(201).json({
            message: 'Student created successfully',
            student: {
                id: newStudent._id,
                userId: newStudent.userId,
                firstName: newStudent.firstName,
                lastName: newStudent.lastName,
                enrollmentNumber: newStudent.enrollmentNumber,
                courses: newStudent.courses,
                dateOfBirth: newStudent.dateOfBirth
            }
        });
    } catch (error) {
        console.error('Error creating student:', error.message);
        res.status(500).json({ error: error.message });
    }
};
