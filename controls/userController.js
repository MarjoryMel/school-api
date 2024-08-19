const User = require('../models/userModel');
const Professor = require('../models/professorModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { registerUserValidator, updateUserValidator, createAdminValidator, loginValidator } = require('../validators/userValidator');
const { generateErrorMessages } = require('../utils/errorMessages');

// Register a new user
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Validate request body
    const { error } = registerUserValidator.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        console.log('Registering user:', { username, email });

        // Check if the user already exists
        const existingUserByEmail = await User.findOne({ email });
        if (existingUserByEmail) {
            return res.status(400).json({ message: generateErrorMessages('USER_ALREADY_EXISTS') });
        }
        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(400).json({ message: generateErrorMessages('USER_ALREADY_EXISTS') });
        }

        // Create a new user
        const newUser = new User({ username, email, password });
        await newUser.save();
        console.log('User registered successfully:', newUser);

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: newUser._id,  username: newUser.username, email: newUser.email, isAdmin: newUser.isAdmin}
        });
    } catch (error) {
        console.error('Error registering user:', error.message);
        res.status(500).json({ error: generateErrorMessages('INTERNAL_ERROR') });
    }
};

// Log in user
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;
    const { error } = loginValidator.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: generateErrorMessages('INVALID_USERNAME_OR_PASSWORD') });
        }

        // Compare the provided password with the stored password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: generateErrorMessages('INVALID_USERNAME_OR_PASSWORD') });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Find professor by userId
        const professor = await Professor.findOne({ userId: user._id });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {id: user._id,username: user.username,email: user.email,isAdmin: user.isAdmin,isProfessor: !!professor, professor: professor ? 
                { firstName: professor.firstName, lastName: professor.lastName, department: professor.department, courses: professor.courses, officeLocation: professor.officeLocation } : null
            }
        });
    } catch (error) {
        res.status(500).json({ error: generateErrorMessages('INTERNAL_ERROR') });
    }
};

// Create new administrators (only admins can)
exports.createAdmin = async (req, res) => {
    const { username, email, password } = req.body;

    // Validate request body
    const { error } = createAdminValidator.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        // Check if the authenticated user is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: generateErrorMessages('ACCESS_DENIED') });
        }

        console.log('Creating admin user:', { username, email });

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: generateErrorMessages('USER_ALREADY_EXISTS') });
        }

        // Create and save a new admin user
        const newAdmin = new User({username, email, password, isAdmin: true
        });

        await newAdmin.save();
        console.log('Admin created successfully:', newAdmin);

        res.status(201).json({
            message: 'Admin created successfully',
            user: { id: newAdmin._id, username: newAdmin.username, email: newAdmin.email, isAdmin: newAdmin.isAdmin }
        });
    } catch (error) {
        res.status(500).json({ error: generateErrorMessages('INTERNAL_ERROR') });
    }
};

// Delete only users (only admins can)
exports.deleteUser = async (req, res) => {
    // User ID to be deleted
    const { id } = req.params;

    try {
        // Checks if the authenticated user is an administrator
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: generateErrorMessages('ACCESS_DENIED') });
        }

        // Checks if the authenticated user is trying to delete another administrator
        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            return res.status(404).json({ message: generateErrorMessages('USER_NOT_FOUND') });
        }

        if (userToDelete.isAdmin) {
            return res.status(403).json({ message: generateErrorMessages('CANNOT_DELETE_ADMIN') });
        }

        // Delete the user
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: generateErrorMessages('INTERNAL_ERROR') });
    }
};

// Update user data (only the user himself or an admin)
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, password } = req.body;

    // Validate request body
    const { error } = updateUserValidator.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        // Check if the authenticated user is an admin or if the user is updating their own data
        if (!req.user.isAdmin) {
            // If not an admin, ensure the user is updating their own data
            if (req.user.userId !== id) {
                return res.status(403).json({ message: generateErrorMessages('USER_CANNOT_UPDATE') });
            }
        }

        // Find and update the user
        const updateData = { username, email, password };
        if (password) {
            // Hash the password if provided
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: generateErrorMessages('USER_NOT_FOUND') });
        }

        console.log('User updated successfully:', updatedUser);
        res.status(200).json({
            message: 'User updated successfully',
            user: { id: updatedUser._id, username: updatedUser.username, email: updatedUser.email, isAdmin: updatedUser.isAdmin }
        });
    } catch (error) {
        res.status(500).json({ error: generateErrorMessages('INTERNAL_ERROR') });
    }
};
