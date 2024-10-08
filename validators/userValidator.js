const Joi = require('joi');
const { generateMessages } = require('../utils/errorMessages');

// Schema for registering a new user
const registerUserValidator = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).pattern(/^\S*$/).required().messages(generateMessages('username', { min: 3, max: 30 })),
    email: Joi.string().email().required().messages(generateMessages('email')),
    password: Joi.string().min(6).required().messages(generateMessages('password', { min: 6 }))
});

// Schema for logging in a user
const loginValidator = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages(generateMessages('username', { min: 3, max: 30 })),
    password: Joi.string().min(6).required().messages(generateMessages('password', { min: 6 }))
});

// Schema for updating user data
const updateUserValidator = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).optional().messages(generateMessages('username', { min: 3, max: 30 })),
    email: Joi.string().email().optional().messages(generateMessages('email')),
    password: Joi.string().min(6).optional().messages(generateMessages('password', { min: 6 }))
});

// Schema for creating a new admin
const createAdminValidator = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages(generateMessages('username', { min: 3, max: 30 })),
    email: Joi.string().email().required().messages(generateMessages('email')),
    password: Joi.string().min(6).required().messages(generateMessages('password', { min: 6 }))
});

module.exports = {
    registerUserValidator,
    updateUserValidator,
    createAdminValidator,
    loginValidator
};