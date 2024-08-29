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
        console.error('Error:', error.message);
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
        console.error('Error:', error.message);
        res.status(500).json({ error: generateErrorMessages('INTERNAL_ERROR') });
    }
};

// Delete only users (only admins can)
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
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

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error:', error.message);
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
            if (req.user.userId !== id) {
                return res.status(403).json({ message: generateErrorMessages('USER_CANNOT_UPDATE') });
            }
        }

        // Find and update the user
        const updateData = { username, email, password };
        if (password) {
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
        console.error('Error:', error.message);
        res.status(500).json({ error: generateErrorMessages('INTERNAL_ERROR') });
    }
};

// List all users (accessible by admins only)
exports.listUsers = async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: generateErrorMessages('ACCESS_DENIED') });
        }

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

        // Find users with pagination
        const users = await User.find()
            .skip(skip)
            .limit(limit);

        const totalUsers = await User.countDocuments();
        const totalPages = Math.ceil(totalUsers / limit);

        if (page > totalPages) {
            return res.status(404).json({ error: generateErrorMessages('PAGE_NOT_FOUND') });
        }

        if (users.length === 0) {
            return res.status(404).json({ error: generateErrorMessages('USER_NOT_REGISTRATION') });
        }

        // Return the list of users
        return res.status(200).json({
            message: 'Users retrieved successfully',
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
            users: users.map(user => ({
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin
            }))
        });
    } catch (error) {
        console.error('Error retrieving users:', error.message);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
