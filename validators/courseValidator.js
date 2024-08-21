const Joi = require('joi');
const { generateMessages } = require('../utils/errorMessages');

// Define the schema for course validation
const courseCreationValidator = Joi.object({
    title: Joi.string().min(3).max(100).required().messages(generateMessages('title', { min: 3, max: 100 })),
    department: Joi.string().min(3).max(50).required().messages(generateMessages('department', { min: 3, max: 50 })),
    professors: Joi.array().items(Joi.string().length(24).hex()).optional().messages(generateMessages('professors')),
    students: Joi.array().items(Joi.string().length(24).hex()).optional().messages(generateMessages('students')),
    capacity: Joi.number().integer().min(1).required().messages(generateMessages('capacity', { min: 1 }))
});

// Define the schema for course validation
const courseUpdateValidator = Joi.object({
    title: Joi.string().min(3).max(100).optional().messages(generateMessages('title', { min: 3, max: 100 })),
    department: Joi.string().min(3).max(50).optional().messages(generateMessages('department', { min: 3, max: 50 })),
    professors: Joi.array().items(Joi.string().length(24).hex()).optional().messages(generateMessages('professors')),
    students: Joi.array().items(Joi.string().length(24).hex()).optional().messages(generateMessages('students')),
    capacity: Joi.number().integer().min(1).optional().messages(generateMessages('capacity', { min: 1 }))
});

module.exports = {
    courseCreationValidator,
    courseUpdateValidator
};
