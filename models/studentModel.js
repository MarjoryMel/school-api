const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Defining the Student Schema
const studentSchema = new Schema({
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
    enrollmentNumber: {
        type: String,
        required: true,
        unique: true 
    },
    courses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course' 
    }]
}, {
    timestamps: true
});

// Creating the Model with the Schema
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
