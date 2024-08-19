const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

// Defining the User Schema
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true, 
    },
    password: {
        type: String,
        required: true,
    },
    
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Hook to hash password before saving the user
userSchema.pre('save', async function(next) {
    // Skip hashing if the password has not been modified
    if (!this.isModified('password')) return next()

    try {
        const salt = await bcrypt.genSalt(10);
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
