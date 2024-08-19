const Student = require('../models/studentModel');
const Course = require('../models/courseModel');
const { generateEnrollmentNumber } = require('../utils/support');
const { studentCreationValidator, studentUpdateValidator } = require('../validators/studentValidator');
const { generateErrorMessages } = require('../utils/errorMessages');

// Function to create a new student (only admins can)
exports.createStudent = async (req, res) => {
    // Check if the authenticated user is an admin
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: generateErrorMessages('ACCESS_DENIED') });
    }

    const { userId, firstName, lastName, courses, dateOfBirth } = req.body;

    // Validate the request body
    const { error } = studentCreationValidator.validate({ userId, firstName, lastName, courses, dateOfBirth });
    if (error) {
        return res.status(400).json({ message: generateErrorMessages('VALIDATION_ERROR') });
    }

    try {
        // Generate a new enrollment number
        const enrollmentNumber = generateEnrollmentNumber();

        // Create a new student
        const newStudent = new Student({ userId, firstName, lastName, enrollmentNumber, courses, dateOfBirth });
        await newStudent.save();

        // Add the new student to the specified courses
        if (courses && Array.isArray(courses)) {
            for (const courseId of courses) {
                const course = await Course.findById(courseId);
                if (course) {
                    if (!course.students.includes(newStudent._id)) {
                        course.students.push(newStudent._id);
                        await course.save();
                    }
                }
            }
        }

        res.status(201).json({
            message: 'Student created successfully',
            student: { id: newStudent._id, userId: newStudent.userId, firstName: newStudent.firstName, lastName: newStudent.lastName, enrollmentNumber: newStudent.enrollmentNumber,  courses: newStudent.courses,  dateOfBirth: newStudent.dateOfBirth }
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: generateErrorMessages('INTERNAL_ERROR') });
    }
};

// Get student details by enrollment number (any authenticated user with a valid token)
exports.getStudent = async (req, res) => {
    const { enrollmentNumber } = req.params;

    try {
        // Find student by enrollment number
        const student = await Student.findOne({ enrollmentNumber });
        if (!student) {
            return res.status(404).json({ message: generateErrorMessages('STUDENT_NOT_FOUND') });
        }
        res.status(200).json({
            student: { id: student._id, userId: student.userId, firstName: student.firstName, lastName: student.lastName, enrollmentNumber: student.enrollmentNumber, courses: student.courses,  dateOfBirth: student.dateOfBirth }
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: generateErrorMessages('INTERNAL_ERROR') });
    }
};

// Update student details (only admins or the student themselves can)
exports.updateStudent = async (req, res) => {
    const { enrollmentNumber } = req.params;
    const updates = req.body;

    try {
        // Find the student by enrollment number
        const student = await Student.findOne({ enrollmentNumber });
        if (!student) {
            return res.status(404).json({ message: generateErrorMessages('STUDENT_NOT_FOUND') });
        }

        // Validate the request body
        const { error } = studentUpdateValidator.validate(updates);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Check if the authenticated user is an admin or the student themselves
        const isAdminOrSelf = req.user.isAdmin || req.user.userId.toString() === student.userId.toString();
        if (isAdminOrSelf) {
            // Remove the student from the old courses
            if (student.courses && Array.isArray(student.courses)) {
                for (const courseId of student.courses) {
                    const course = await Course.findById(courseId);
                    if (course) {
                        course.students = course.students.filter(studentId => !studentId.equals(student._id));
                        await course.save();
                    }
                }
            }

            // Update student details
            Object.keys(updates).forEach((key) => {
                student[key] = updates[key];
            });

            // If the courses array is being updated
            if (updates.courses && Array.isArray(updates.courses)) {
                // Set the new list of courses
                student.courses = updates.courses;

                // Add the student to the new courses
                for (const courseId of student.courses) {
                    const course = await Course.findById(courseId);
                    if (course) {
                        if (!course.students.includes(student._id)) {
                            course.students.push(student._id);
                            await course.save();
                        }
                    }
                }
            }
            await student.save();
            return res.status(200).json({
                message: 'Student updated successfully',
                student: { id: student._id, userId: student.userId, firstName: student.firstName, lastName: student.lastName, enrollmentNumber: student.enrollmentNumber, courses: student.courses, dateOfBirth: student.dateOfBirth }
            });
        } else {
            return res.status(403).json({ message: generateErrorMessages('ACCESS_DENIED') });
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: generateErrorMessages('INTERNAL_ERROR') });
    }
};



// Delete a student (only admins can)
exports.deleteStudent = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the authenticated user is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: generateErrorMessages('ACCESS_DENIED') });
        }

        // Find and delete the student by ID
        const student = await Student.findByIdAndDelete(id);
        if (!student) {
            return res.status(404).json({ message: generateErrorMessages('STUDENT_NOT_FOUND') });
        }
        console.log('Student deleted successfully:', student);
        return res.status(200).json({
            message: 'Student deleted successfully',
            student: { id: student._id, userId: student.userId, firstName: student.firstName, lastName: student.lastName, enrollmentNumber: student.enrollmentNumber,courses: student.courses, dateOfBirth: student.dateOfBirth }
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: generateErrorMessages('INTERNAL_ERROR') });
    }
};

// List all students (accessible by any user)
exports.listStudents = async (req, res) => {
    try {
        // Find all students
        const students = await Student.find();

        // Check if any students are found
        if (students.length === 0) {
            return res.status(404).json({ message: generateErrorMessages('NO_STUDENTS_FOUND') });
        }

        // Return the list of students
        return res.status(200).json({
            message: 'Students retrieved successfully',
            students: students.map(student => ({ id: student._id, userId: student.userId, firstName: student.firstName, lastName: student.lastName, enrollmentNumber: student.enrollmentNumber, courses: student.courses, dateOfBirth: student.dateOfBirth }))
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: generateErrorMessages('INTERNAL_ERROR') });
    }
};

