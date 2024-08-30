const Course = require('../models/courseModel');
const Student = require('../models/studentModel');
const Professor = require('../models/professorModel');
const User = require('../models/userModel');
const { courseCreationValidator, courseUpdateValidator } = require('../validators/courseValidator');
const { generateErrorMessages } = require('../utils/errorMessages');

// Create a new course (only admins can)
exports.createCourse = async (req, res) => {
    const { title, department, professors, students, capacity } = req.body;

    // Validate the course data
    const { error } = courseCreationValidator.validate({ title, department, professors, students, capacity });
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
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
        // Find the course by ID and populate professor and student details
        const course = await Course.findById(id)
            .populate('professors', 'firstName lastName')  
            .populate('students', 'firstName lastName');   
        if (!course) {
            return res.status(404).json({ message: generateErrorMessages('COURSE_NOT_FOUND') });
        }

        const professors = course.professors.map(professor => ({ id: professor._id, firstName: professor.firstName, lastName: professor.lastName }));

        const students = course.students.map(student => ({ id: student._id, firstName: student.firstName,  lastName: student.lastName }));

        return res.status(200).json({ course: { id: course._id,  title: course.title,  department: course.department, professors: professors,  students: students }  });
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
        
        if (page > totalPages) {
            return res.status(404).json({ error: generateErrorMessages('PAGE_NOT_FOUND') });
        }

        if (courses.length === 0) {
            return res.status(409).json({ error: generateErrorMessages('COURSE_NOT_REGISTRATION') });
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

// Get a summary of students and professors distribution and average course capacity
exports.getCourseSummary = async (req, res) => {
    try {
        // Retrieve total number of students and professors in each course with capacity
        const studentsAndProfessorsPerCourse = await Course.aggregate([
            {
                $lookup: {
                    from: 'students',
                    localField: 'students',
                    foreignField: '_id',
                    as: 'studentsList'
                }
            },
            {
                $lookup: {
                    from: 'professors',
                    localField: 'professors',
                    foreignField: '_id',
                    as: 'professorsList'
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    capacity: 1,
                    department: 1,
                    totalStudents: { $size: '$studentsList' },
                    totalProfessors: { $size: '$professorsList' },
                    professorsNames: { 
                        $map: {
                            input: '$professorsList',
                            as: 'professor',
                            in: { name: { $concat: ['$$professor.firstName', ' ', '$$professor.lastName'] } }
                        }
                    }
                }
            }
        ]);

        // Retrieve total number of students and professors in each department
        const studentsAndProfessorsPerDepartment = await Course.aggregate([
            {
                $lookup: {
                    from: 'students',
                    localField: 'students',
                    foreignField: '_id',
                    as: 'studentsList'
                }
            },
            {
                $lookup: {
                    from: 'professors',
                    localField: 'professors',
                    foreignField: '_id',
                    as: 'professorsList'
                }
            },
            {
                $group: {
                    _id: '$department',
                    totalStudents: { $sum: { $size: '$studentsList' } },
                    totalProfessors: { $sum: { $size: '$professorsList' } }
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

        const response = {
            message: 'Course summary retrieved successfully',
            data: {
                studentsAndProfessorsPerCourse,
                studentsAndProfessorsPerDepartment,
                averageCapacity: averageCapacityResult ? averageCapacityResult.averageCapacity : 0
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error retrieving course summary:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

