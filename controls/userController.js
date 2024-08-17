const User = require('../models/userModel');
const authMiddleware = require('../utils/middlewares');
const Professor = require('../models/professorModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register a new user
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        console.log('Registering user:', { username, email });

        // Create a new user
        const newUser = new User({ username, email, password });
        await newUser.save();
        console.log('User registered successfully:', newUser);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id, 
                username: newUser.username,
                email: newUser.email,
                isAdmin: newUser.isAdmin
            }
        });
    } catch (error) {
        console.error('Error registering user:', error.message);
        res.status(500).json({ error: error.message });
    }
};


// Log in user
exports.loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Compare the provided password with the stored password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
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
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                isProfessor: !!professor,
                professor: professor ? {
                    firstName: professor.firstName,
                    lastName: professor.lastName,
                    department: professor.department,
                    courses: professor.courses,
                    officeLocation: professor.officeLocation
                } : null
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new administrators (only admins can)
exports.createAdmin = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if the authenticated user is an admin
        if (!req.user.isAdmin) {
            console.log('Access denied. User is not an admin.');
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        console.log('Creating admin user:', { username, email });

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User with this email already exists.');
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // Create and save a new admin user
        const newAdmin = new User({
            username,
            email,
            password,
            isAdmin: true
        });

        await newAdmin.save();
        console.log('Admin created successfully:', newAdmin);

        res.status(201).json({
            message: 'Admin created successfully',
            user: {
                id: newAdmin._id, 
                username: newAdmin.username,
                email: newAdmin.email,
                isAdmin: newAdmin.isAdmin
            }
        });
    } catch (error) {
        console.error('Error creating admin:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Delete only users (only admins can)
exports.deleteUser = async (req, res) => {
    // User ID to be deleted
    const { id } = req.params;

    try {
        // Checks if the authenticated user is an administrator
        if (!req.user.isAdmin) {
            console.log('Access denied. Only admins can delete users.');
            return res.status(403).json({ message: 'Access denied. Only admins can delete users.' });
        }

        // Checks if the authenticated user is trying to delete another administrator
        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        if (userToDelete.isAdmin) {
            console.log('Admin users cannot be deleted by other admins.');
            return res.status(403).json({ message: 'Admin users cannot be deleted by other admins.' });
        }

        // Delete the user
        await User.findByIdAndDelete(id);
        console.log('User deleted successfully:', userToDelete);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ error: error.message });
    }
};

// Update user data (only the user himself or an admin)
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, password } = req.body;

    try {
        // Check if the authenticated user is an admin or if the user is updating their own data
        if (!req.user.isAdmin) {
            // If not an admin, ensure the user is updating their own data
            if (req.user.userId !== id) {
                console.log('Access denied. Users can only update their own data.');
                return res.status(403).json({ message: 'Access denied. Users can only update their own data.' });
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
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User updated successfully:', updatedUser);

        res.status(200).json({
            message: 'User updated successfully',
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin
            }
        });
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ error: error.message });
    }
};


