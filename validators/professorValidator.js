const Joi = require('joi');
const { generateMessages } = require('../utils/errorMessages');

const professorValidator = Joi.object({
    userId: Joi.string().required().messages(generateMessages('userId')),
    firstName: Joi.string().min(2).max(50).required().messages(generateMessages('firstName', { min: 2, max: 50 })),
    lastName: Joi.string().min(2).max(50).required().messages(generateMessages('lastName', { min: 2, max: 50 })),
    courses: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).messages(generateMessages('courses')),
    officeLocation: Joi.string().optional().allow('').messages(generateMessages('officeLocation')),
});

module.exports = {
    professorValidator
};

