const Joi = require('joi');

// Schema for registering a new user
const registerUserSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

// Schema for logging in a user
const loginUserSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required()
});


// Schema for updating user data
const updateUserSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30),
    email: Joi.string().email(),
    password: Joi.string().min(6)
});

// Schema for creating a new admin
const createAdminSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

module.exports = {
    registerUserSchema,
    updateUserSchema,
    createAdminSchema,
    loginUserSchema
};
