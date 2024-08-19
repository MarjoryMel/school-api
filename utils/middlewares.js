const jwt = require('jsonwebtoken');

// Middleware function to authenticate users using JWT
const authMiddleware = (req, res, next) => {
    // Retrieve token from the Authorization header
    const token = req.header('Authorization').replace('Bearer ', '');

    // Check if token is provided
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

module.exports = authMiddleware;
