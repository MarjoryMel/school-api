// utils/errorMessages.js
const generateMessages = (field, options = {}) => {
    return {
        'string.base': `The ${field} field must be a string.`,
        'string.empty': `The ${field} field cannot be empty.`,
        'string.min': `The ${field} field must be at least ${options.min || 0} characters long.`,
        'string.max': `The ${field} field must be at most ${options.max || 0} characters long.`,
        'string.alphanum': `The ${field} field must only contain alphanumeric characters.`,
        'any.required': `The ${field} field is required.`,
        'array.base': `The ${field} field must be a list.`,
        'string.pattern.base': `Each item in ${field} must be a valid ID (24 hexadecimal characters).`,
        'string.email': `The ${field} field must be a valid email address.`,
        'string.regex.base': `The ${field} field must be in the format YYYY-MM-DD.`,
        'custom': `The ${field} field must be a valid date in the format YYYY-MM-DD.`
    };
};

module.exports = {
    generateMessages
};
