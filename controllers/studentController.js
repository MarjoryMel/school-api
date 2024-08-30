const Student = require('../models/studentModel');
const Course = require('../models/courseModel');
const { generateEnrollmentNumber } = require('../utils/support');
const { studentCreationValidator, studentUpdateValidator } = require('../validators/studentValidator');
const { generateErrorMessages } = require('../utils/errorMessages');

// Function to create a new student (only admins can)
exports.createStudent = async (req, res) => {
    const { userId, firstName, lastName, courses } = req.body;

    const { error } = studentCreationValidator.validate({ userId, firstName, lastName, courses });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        // Generate a new enrollment number
        const enrollmentNumber = generateEnrollmentNumber();

        // Create a new student
        const newStudent = new Student({ userId, firstName, lastName, enrollmentNumber, courses });
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
            student: { id: newStudent._id, userId: newStudent.userId, firstName: newStudent.firstName, lastName: newStudent.lastName, enrollmentNumber: newStudent.enrollmentNumber,  courses: newStudent.courses }
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
        const student = await Student.findOne({ enrollmentNumber }).populate('courses');
        if (!student) {
            return res.status(404).json({ message: generateErrorMessages('STUDENT_NOT_FOUND') });
        }

        // Map the courses to include both the ID and the title
        const courses = student.courses.map(course => ({
            id: course._id,
            title: course.title
        }));

        res.status(200).json({
            student: { id: student._id, userId: student.userId, firstName: student.firstName, lastName: student.lastName, enrollmentNumber: student.enrollmentNumber, courses: courses } });
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
                student.courses = updates.courses;
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
                student: { id: student._id, userId: student.userId, firstName: student.firstName, lastName: student.lastName, enrollmentNumber: student.enrollmentNumber, courses: student.courses }
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
    const { enrollmentNumber } = req.params;

    try {
        // Find and delete the student by enrollment number
        const student = await Student.findOneAndDelete({ enrollmentNumber });
        if (!student) {
            return res.status(404).json({ message: generateErrorMessages('STUDENT_NOT_FOUND') });
        }
        
        console.log('Student deleted successfully:', student);
        return res.status(200).json({
            message: 'Student deleted successfully',
            student: { id: student._id, userId: student.userId, firstName: student.firstName, lastName: student.lastName, enrollmentNumber: student.enrollmentNumber, courses: student.courses }
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: generateErrorMessages('INTERNAL_ERROR') });
    }
};


// List all students (accessible by any user)
exports.listStudents = async (req, res) => {
    try {
        // Retrieve pagination parameters from query
        const limit = parseInt(req.query.limit, 10);
        const page = parseInt(req.query.page, 10);
        
        // Validate limit and page
        const validLimits = [5, 10, 30];
        if (!validLimits.includes(limit)) {
            return res.status(400).json({ error: generateErrorMessages('INVALID_PAGE_LIMITE') });
        }
        if (page < 1 || isNaN(page)) {
            return res.status(400).json({ error: generateErrorMessages('INVALID_PAGE_PARAMETER') });
        }

        // Calculate the number of items to skip
        const skip = (page - 1) * limit;

        const totalStudents = await Student.countDocuments();
        const totalPages = Math.ceil(totalStudents / limit);

        if (page > totalPages) {
            return res.status(404).json({ error: generateErrorMessages('PAGE_NOT_FOUND') });
        }

        // Find students with pagination and populate the courses field
        const students = await Student.find()
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'courses',
                select: 'title'
            });

        if (students.length === 0) {
            return res.status(409).json({ message: generateErrorMessages('STUDENT_NOT_REGISTRATION') });
        }

        // Return the list of students with pagination info
        return res.status(200).json({
            message: 'Students retrieved successfully',
            totalStudents,
            totalPages,
            currentPage: page,
            students: students.map(student => ({
                id: student._id,
                userId: student.userId,
                firstName: student.firstName,
                lastName: student.lastName,
                enrollmentNumber: student.enrollmentNumber,
                courses: student.courses.map(course => ({
                    id: course._id,
                    title: course.title
                })),
            }))
        });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: generateErrorMessages('INTERNAL_ERROR') });
    }
};



