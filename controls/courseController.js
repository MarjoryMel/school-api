const Course = require('../models/courseModel');
const Student = require('../models/studentModel');
const User = require('../models/userModel');
const { courseCreationValidator, courseUpdateValidator } = require('../validators/courseValidator');
const { generateErrorMessages } = require('../utils/errorMessages');

// Create a new course (only admins can)
exports.createCourse = async (req, res) => {
    const { title, department, professors, students } = req.body;

    // Validate the course data
    const { error } = courseCreationValidator.validate({ title, department, professors, students });
    if (error) {
        return res.status(400).json({ message: generateErrorMessages('VALIDATION_ERROR') });
    }

    try {
        // Check if the authenticated user is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: generateErrorMessages('ACCESS_DENIED') });
        }

        // Check if a course with the same title already exists
        const existingCourse = await Course.findOne({ title });
        if (existingCourse) {
            return res.status(400).json({ message: generateErrorMessages('COURSE_ALREADY_EXISTS') });
        }

        // Create a new course
        const newCourse = new Course({ title, department, professors, students });
        await newCourse.save();
        console.log('Course created successfully:', newCourse);
        res.status(201).json({
            message: 'Course created successfully',
            course: { id: newCourse._id, title: newCourse.title, department: newCourse.department, professors: newCourse.professors, students: newCourse.students }
        });
    } catch (error) {
        console.error('Error creating course:', error.message);
        res.status(500).json({ message: generateErrorMessages('INTERNAL_ERROR') });
    }
};

// Get course details (accessible by any user)
exports.getCourse = async (req, res) => {
    const { id } = req.params;

    try {
        // Find the course by ID
        const course = await Course.findById(id).populate('professors').populate('students');
        if (!course) {
            return res.status(404).json({ message: generateErrorMessages('COURSE_NOT_FOUND') });
        }

        // Return the course details with only IDs for professors and students
        return res.status(200).json({
            message: 'Course retrieved successfully',
            course: { id: course._id, title: course.title, department: course.department, professors: course.professors.map(professor => professor._id), students: course.students.map(student => student._id)}
        });
    } catch (error) {
        console.error('Error retrieving course:', error.message);
        res.status(500).json({ message: generateErrorMessages('INTERNAL_ERROR') });
    }
};

// Update course details (only admins can)
exports.updateCourse = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        // Check if the authenticated user is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: generateErrorMessages('ACCESS_DENIED') });
        }

        // Validate the request body
        const { error } = courseUpdateValidator.validate(updates);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Find the course by ID
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: generateErrorMessages('COURSE_NOT_FOUND') });
        }

        // Update the course details
        Object.keys(updates).forEach(key => {
            course[key] = updates[key];
        });
        await course.save();

        // Return the updated course details
        return res.status(200).json({
            message: 'Course updated successfully',
            course: { id: course._id, title: course.title, department: course.department, professors: course.professors, students: course.students }
        });
    } catch (error) {
        console.error('Error updating course:', error.message);
        res.status(500).json({ message: generateErrorMessages('INTERNAL_ERROR') });
    }
};

// Delete a course (only admins can)
exports.deleteCourse = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the authenticated user is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: generateErrorMessages('ACCESS_DENIED') });
        }

        // Find and delete the course by ID
        const course = await Course.findByIdAndDelete(id);
        if (!course) {
            return res.status(404).json({ message: generateErrorMessages('COURSE_NOT_FOUND') });
        }
        
        // Remove the course reference from the students' courses array
        await Student.updateMany({ courses: id }, { $pull: { courses: id } });

        console.log('Course deleted successfully:', course);
        return res.status(200).json({
            message: 'Course deleted successfully',
            course: { id: course._id, title: course.title, department: course.department }
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: generateErrorMessages('INTERNAL_ERROR') });
    }
};
