const User = require('../models/userModel');
const authMiddleware = require('../utils/middlewares');
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
                id: newUser._id,  // Include the user's ID in the response
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
    const { email, password } = req.body;

    try {
        console.log('Logging in user with email:', email);

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check the password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match result:', isMatch);

        if (!isMatch) {
            console.log('Invalid password');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        console.log('Generated token:', token);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Error logging in user:', error.message);
        res.status(500).json({ error: error.message });
    }
};

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
                id: newAdmin._id,  // Include the admin's ID in the response
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

