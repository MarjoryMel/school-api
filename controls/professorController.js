const Professor = require('../models/professorModel');
const User = require('../models/userModel');

// Create a new professor (only admins can)
exports.createProfessor = async (req, res) => {
    const { userId, firstName, lastName, department, courses, officeLocation } = req.body;

    // Check if all required fields are provided
    if (!userId || !firstName || !lastName || !department) {
        return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    try {
        // Check if the authenticated user is an admin
        if (!req.user.isAdmin) {
            console.log('Access denied. User is not an admin.');
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        // Check if the user exists and is not already a professor
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        const existingProfessor = await Professor.findOne({ userId });
        if (existingProfessor) {
            console.log('User is already a professor');
            return res.status(400).json({ message: 'User is already a professor' });
        }

        // Create a new professor
        const newProfessor = new Professor({
            userId,
            firstName,
            lastName,
            department,
            courses,
            officeLocation
        });

        await newProfessor.save();
        console.log('Professor created successfully:', newProfessor);

        res.status(201).json({
            message: 'Professor created successfully',
            professor: {
                id: newProfessor._id,
                userId: newProfessor.userId, 
                firstName: newProfessor.firstName,
                lastName: newProfessor.lastName,
                department: newProfessor.department,
                courses: newProfessor.courses,
                officeLocation: newProfessor.officeLocation
            }
        });
    } catch (error) {
        console.error('Error creating professor:', error.message);
        res.status(500).json({ error: error.message });
    }
};


// Get professor details by ID
exports.getProfessor = async (req, res) => {
    const { id } = req.params;

    try {
        // Find professor by ID
        const professor = await Professor.findById(id);

        if (!professor) {
            return res.status(404).json({ message: 'Professor not found' });
        }

        res.status(200).json({
            professor: {
                id: professor._id,
                userId: professor.user,
                firstName: professor.firstName,
                lastName: professor.lastName,
                department: professor.department,
                courses: professor.courses,
                officeLocation: professor.officeLocation
            }
        });
    } catch (error) {
        console.error('Error retrieving professor:', error.message);
        res.status(500).json({ error: error.message });
    }
};