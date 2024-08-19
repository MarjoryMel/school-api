
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

const generateErrorMessages = (type, details = {}) => {
    const messages = {
        'ACCESS_DENIED': 'Access denied. Admins only.',
        'USER_NOT_FOUND': 'User not found.',
        'USER_CANNOT_UPDATE': 'Users can only update their own data.',
        'USER_ALREADY_EXISTS': 'User with this email or username already exists.',
        'INVALID_USERNAME_OR_PASSWORD': 'Invalid username or password.',
        'CANNOT_DELETE_ADMIN': 'Admin users cannot be deleted by other admins.',
        'PROFESSOR_ALREADY_EXISTS': 'User is already a professor.',
        'PROFESSOR_NOT_FOUND': 'Professor not found.',
        'NO_PROFESSORS_FOUND': 'No professors found.',
        'VALIDATION_ERROR': 'Validation error occurred.',
        'INTERNAL_ERROR': 'An internal error occurred.',
        'COURSE_ALREADY_EXISTS': 'A course with this title already exists.',
        'STUDENT_NOT_FOUND': 'Student not found.'
    };

    return messages[type] || 'Unknown error.';
};


module.exports = {
    generateMessages,
    generateErrorMessages
};
