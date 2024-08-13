const User = require('../models/userModel');

// Registrar um novo usuário
exports.registerUser = async (req, res) => {
    const { username, email, password, isAdmin } = req.body;
    
    try {
        // Cria um novo usuário com o campo isAdmin
        const newUser = new User({ username, email, password, isAdmin });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
