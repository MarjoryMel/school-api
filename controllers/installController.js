const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Professor = require('../models/professorModel');
const Student = require('../models/studentModel');
const Course = require('../models/courseModel');
const { generateEnrollmentNumber } = require('../utils/support');

const installDatabase = async (req, res) => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Professor.deleteMany({});
        await Student.deleteMany({});
        await Course.deleteMany({});

        // Define user data
        const usersData = [
            { username: 'admin', email: 'admin@example.com', password: 'adminpass', isAdmin: true },
            { username: 'professor1', email: 'professor1@example.com', password: 'password1', isAdmin: false },
            { username: 'professor2', email: 'professor2@example.com', password: 'password1', isAdmin: false },
            { username: 'professor3', email: 'professor3@example.com', password: 'password1', isAdmin: false },
            { username: 'professor4', email: 'professor4@example.com', password: 'password1', isAdmin: false },
            { username: 'professor5', email: 'professor5@example.com', password: 'password1', isAdmin: false },
            { username: 'student1', email: 'student1@example.com', password: 'password1', isAdmin: false },
            { username: 'student2', email: 'student2@example.com', password: 'password1', isAdmin: false },
            { username: 'student3', email: 'student3@example.com', password: 'password1', isAdmin: false },
            { username: 'student4', email: 'student4@example.com', password: 'password1', isAdmin: false },
            { username: 'student5', email: 'student5@example.com', password: 'password1', isAdmin: false },
            { username: 'user', email: 'user@example.com', password: 'userpass', isAdmin: false }
        ];

        // Hash passwords
        const hashedUsersData = await Promise.all(usersData.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            return { ...user, password: hashedPassword };
        }));

        // Create Users
        const users = await User.insertMany(hashedUsersData);

        // Create Courses
        const courses = await Course.insertMany([
            { title: 'Mathematics', department: 'Science', capacity: 30 },
            { title: 'Physics', department: 'Science', capacity: 25 },
            { title: 'Chemistry', department: 'Science', capacity: 20 },
            { title: 'Biology', department: 'Science', capacity: 35 },
            { title: 'Computer Science', department: 'Engineering', capacity: 40 }
        ]);

        // Create Professors
        const professors = await Professor.insertMany([
            { userId: users[1]._id, firstName: 'John', lastName: 'Doe', officeLocation: 'Room 101', courses: [courses[0]._id, courses[1]._id] },
            { userId: users[2]._id, firstName: 'Jane', lastName: 'Smith', officeLocation: 'Room 102', courses: [courses[2]._id, courses[3]._id] },
            { userId: users[3]._id, firstName: 'Alice', lastName: 'Johnson', officeLocation: 'Room 103', courses: [courses[4]._id] },
            { userId: users[4]._id, firstName: 'Bob', lastName: 'Brown', officeLocation: 'Room 104', courses: [courses[0]._id] },
            { userId: users[5]._id, firstName: 'Carol', lastName: 'Williams', officeLocation: 'Room 105', courses: [courses[1]._id, courses[2]._id] }
        ]);

        // Create Students
        const students = await Student.insertMany([
            { userId: users[6]._id, firstName: 'Mike', lastName: 'Taylor', enrollmentNumber: generateEnrollmentNumber(), courses: [courses[0]._id, courses[1]._id] },
            { userId: users[7]._id, firstName: 'Emma', lastName: 'Wilson', enrollmentNumber: generateEnrollmentNumber(), courses: [courses[2]._id, courses[3]._id] },
            { userId: users[8]._id, firstName: 'Oliver', lastName: 'Anderson', enrollmentNumber: generateEnrollmentNumber(), courses: [courses[4]._id] },
            { userId: users[9]._id, firstName: 'Sophia', lastName: 'Moore', enrollmentNumber: generateEnrollmentNumber(), courses: [courses[0]._id] },
            { userId: users[10]._id, firstName: 'Liam', lastName: 'Jackson', enrollmentNumber: generateEnrollmentNumber(), courses: [courses[1]._id] }
        ]);

        // Update Courses with Professors and Students
        await Promise.all(courses.map(async course => {
            await Course.findByIdAndUpdate(course._id, {
                $set: {
                    professors: professors.filter(p => p.courses.includes(course._id)).map(p => p._id),
                    students: students.filter(s => s.courses.includes(course._id)).map(s => s._id)
                }
            }, { new: true });
        }));
        
        res.status(200).json({ message: 'Database installed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error installing database', error });
    }
};

module.exports = {
    installDatabase
};
