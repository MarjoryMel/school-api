const Course = require('../models/courseModel');
const Student = require('../models/studentModel');
const User = require('../models/userModel');
const { courseCreationValidator, courseUpdateValidator } = require('../validators/courseValidator');
const { generateErrorMessages } = require('../utils/errorMessages');

// Create a new course (only admins can)
exports.createCourse = async (req, res) => {
    const { title, department, professors, students, capacity } = req.body;

    // Validate the course data
    const { error } = courseCreationValidator.validate({ title, department, professors, students, capacity });
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
        const newCourse = new Course({ title, department, professors, students, capacity });
        await newCourse.save();
        console.log('Course created successfully:', newCourse);
        res.status(201).json({
            message: 'Course created successfully',
            course: { id: newCourse._id, title: newCourse.title, department: newCourse.department, professors: newCourse.professors, students: newCourse.students, capacity: newCourse.capacity }
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
            course: { id: course._id, title: course.title, department: course.department, professors: course.professors, students: course.students, capacity: course.capacity }
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

// List all courses (accessible by any user)
exports.listCourses = async (req, res) => {
    try {
        // Get pagination parameters from query
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

        // Find courses with pagination and populate the professors and students fields
        const courses = await Course.find()
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'professors',
                select: 'firstName lastName'
            })
            .populate({
                path: 'students',
                select: 'firstName lastName'
            });


        // Get total count for pagination information
        const totalCourses = await Course.countDocuments();
        const totalPages = Math.ceil(totalCourses / limit);
        
        // Check if the requested page is valid
        if (page > totalPages) {
            return res.status(404).json({ error: generateErrorMessages('PAGE_NOT_FOUND') });
        }

        // Check if any courses are found
        if (courses.length === 0) {
            return res.status(404).json({ error: generateErrorMessages('COURSE_NOT_REGISTRATION') });
        }

        // Return the list of courses with populated professor and student names
        return res.status(200).json({
            message: 'Courses retrieved successfully',
            totalCourses,
            totalPages: Math.ceil(totalCourses / limit),
            currentPage: page,
            courses: courses.map(course => ({
                id: course._id,
                title: course.title,
                capacity: course.capacity,
                students: course.students.map(student => ({
                    id: student._id,
                    name: `${student.firstName} ${student.lastName}`
                })),
                professors: course.professors.map(professor => ({
                    id: professor._id,
                    name: `${professor.firstName} ${professor.lastName}`
                }))
            }))
        });
    } catch (error) {
        console.error('Error retrieving courses:', error.message);
        res.status(500).json({ message: `Error retrieving courses: ${error.message}` });
    }
};

// Get a summary of students distribution and average course capacity
exports.getCourseSummary = async (req, res) => {
    try {
        // Retrieve total number of students in each course with capacity
        const studentsPerCourse = await Course.aggregate([
            {
                $lookup: {
                    from: 'students',
                    localField: 'students',
                    foreignField: '_id',
                    as: 'studentsList'
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    capacity: 1,
                    department: 1,
                    totalStudents: { $size: '$studentsList' }
                }
            }
        ]);

        // Retrieve total number of students in each department
        const studentsPerDepartment = await Course.aggregate([
            {
                $lookup: {
                    from: 'students',
                    localField: 'students',
                    foreignField: '_id',
                    as: 'studentsList'
                }
            },
            {
                $group: {
                    _id: '$department',
                    totalStudents: { $sum: { $size: '$studentsList' } }
                }
            }
        ]);

        // Retrieve the average capacity of courses
        const [averageCapacityResult] = await Course.aggregate([
            {
                $group: {
                    _id: null,
                    averageCapacity: { $avg: '$capacity' }
                }
            }
        ]);

        // Construct the response object
        const response = {
            message: 'Course summary retrieved successfully',
            data: {
                studentsPerCourse,
                studentsPerDepartment,
                averageCapacity: averageCapacityResult ? averageCapacityResult.averageCapacity : 0
            }
        };

        // Send the response
        res.status(200).json(response);
    } catch (error) {
        console.error('Error retrieving course summary:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};
