const Joi = require('joi');
const { generateMessages } = require('../utils/errorMessages');

// Define the schema for student validation
const studentCreationValidator = Joi.object({
    userId: Joi.string().required().messages(generateMessages('userId')),
    firstName: Joi.string().min(2).max(50).required().messages(generateMessages('firstName', { min: 2, max: 50 })),
    lastName: Joi.string().min(2).max(50).required().messages(generateMessages('lastName', { min: 2, max: 50 })),
    courses: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional().messages(generateMessages('courses')),
    dateOfBirth: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages(generateMessages('dateOfBirth'))
        .custom((value, helpers) => {
            const date = new Date(value);
            if (date.toISOString().slice(0, 10) !== value) {
                return helpers.message('The dateOfBirth field must be a valid date in the format YYYY-MM-DD.');
            }
            return value;
        })
});

// Define the schema for student update validation
const studentUpdateValidator = Joi.object({
    userId: Joi.string().optional().messages(generateMessages('userId')),
    firstName: Joi.string().min(2).max(50).optional().messages(generateMessages('firstName', { min: 2, max: 50 })),
    lastName: Joi.string().min(2).max(50).optional().messages(generateMessages('lastName', { min: 2, max: 50 })),
    courses: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).optional().messages(generateMessages('courses')),
    dateOfBirth: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional().messages(generateMessages('dateOfBirth'))
        .custom((value, helpers) => {
            const date = new Date(value);
            if (date.toISOString().slice(0, 10) !== value) {
                return helpers.message('The dateOfBirth field must be a valid date in the format YYYY-MM-DD.');
            }
            return value;
        })
});

module.exports = { 
    studentCreationValidator,
    studentUpdateValidator
};
