const jwt = require('jsonwebtoken');

// Middleware function to authenticate users using JWT
const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');

    // Check if Authorization header is provided
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

// Middleware to check if user is an admin
const checkAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};


module.exports = { 
    authMiddleware,
    checkAdmin
}
