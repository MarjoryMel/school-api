const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

// Defining the User Schema
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
         // Ensures that the username is unique
        unique: true,
    },
    email: {
        type: String,
        required: true,
        // Ensures that the email is unique
        unique: true, 
        // Validates the email format
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address.']
    },
    password: {
        type: String,
        required: true,
        // Password must be at least 6 characters long
        minlength: 6
    },
    
    isAdmin: {
        type: Boolean,
         // Indicates if the user is an admin
        default: false
    }
}, {
    // Adds createdAt and updatedAt fields
    timestamps: true
});

// Hook to hash password before saving the user
userSchema.pre('save', async function(next) {
    // Skip hashing if the password has not been modified
    if (!this.isModified('password')) return next()

    try {
        // Generate salt
        const salt = await bcrypt.genSalt(10);
         // Hash the password
        this.password = await bcrypt.hash(this.password, salt);
        next(); 
    } catch (error) {
        next(error); 
    }
});

// Method to compare provided password with stored password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // Compare the passwords
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed'); 
    }
};

// Creating the Model with the Schema
const User = mongoose.model('User', userSchema);

module.exports = User;
