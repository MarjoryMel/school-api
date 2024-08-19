const Joi = require('joi');
const { generateMessages } = require('../utils/errorMessages');

// Schema for registering a new user
const registerUserSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).pattern(/^\S*$/).required().messages(generateMessages('username', { min: 3, max: 30 })),
    email: Joi.string().email().required().messages(generateMessages('email')),
    password: Joi.string().min(6).required().messages(generateMessages('password', { min: 6 }))
});

// Schema for logging in a user
const loginUserSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages(generateMessages('username', { min: 3, max: 30 })),
    password: Joi.string().min(6).required().messages(generateMessages('password', { min: 6 }))
});

// Schema for updating user data
const updateUserSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).messages(generateMessages('username', { min: 3, max: 30 })),
    email: Joi.string().email().messages(generateMessages('email')),
    password: Joi.string().min(6).messages(generateMessages('password', { min: 6 }))
});

// Schema for creating a new admin
const createAdminSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages(generateMessages('username', { min: 3, max: 30 })),
    email: Joi.string().email().required().messages(generateMessages('email')),
    password: Joi.string().min(6).required().messages(generateMessages('password', { min: 6 }))
});

module.exports = {
    registerUserSchema,
    updateUserSchema,
    createAdminSchema,
    loginUserSchema
};