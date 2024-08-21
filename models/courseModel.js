const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Defining the Course Schema
const courseSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    capacity: {
        type: Number,
        required: true
    },
    department: {
        type: String,
        required: true,
    },
    professors: [{
        type: Schema.Types.ObjectId,
        ref: 'Professor'
    }],
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'Student' 
    }]
}, {
    timestamps: true
});

// Creating the Model with the Schema
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
