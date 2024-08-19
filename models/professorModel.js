const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Defining the Professor Schema
const professorSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course' 
    }],
    officeLocation: {
        type: String,
    }
}, {
    timestamps: true
});

// Creating the Model with the Schema
const Professor = mongoose.model('Professor', professorSchema);

module.exports = Professor;
