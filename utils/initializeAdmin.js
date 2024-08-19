const User = require('../models/userModel');

// Function to initialize an admin user if none exists
const initializeAdmin = async () => {
    // Check if an admin user already exists
    const adminExists = await User.findOne({ isAdmin: true });

    if (!adminExists) {
        // Create a new admin user if none exists
        const adminUser = new User({
            username: 'admin',
            email: 'admin@example.com',
            password: 'adminpassword',
            isAdmin: true
        });
        await adminUser.save(); 
        console.log('Admin user created'); 
    } else {
        console.log('Admin user already exists.'); 
    }
};

module.exports = initializeAdmin;
