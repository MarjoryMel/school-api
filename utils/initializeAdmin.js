const User = require('../models/userModel');

const initializeAdmin = async () => {
    const adminExists = await User.findOne({ isAdmin: true });

    if (!adminExists) {
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
