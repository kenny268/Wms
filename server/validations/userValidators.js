const { body, param, query } = require('express-validator');

const validateRegisterUser = [
    body('Username').notEmpty().withMessage('Username is required'),
    body('Password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('Email').isEmail().withMessage('Invalid email format'),
    body('FirstName').optional().isString().withMessage('First Name must be a string'),
    body('LastName').optional().isString().withMessage('Last Name must be a string'),
    body('RoleIDs').isArray().withMessage('Role IDs must be an array'),
    body('RoleIDs.*').isInt().withMessage('Each Role ID must be an integer'),
    body('RoleIDs').notEmpty().withMessage('At least one Role ID is required'), // Ensure RoleIDs array is not empty
];

const validateLoginUser = [
    body('Username').notEmpty().withMessage('Username is required'),
    body('Password').notEmpty().withMessage('Password is required'),
];

const validateGetAllUsers = [
    query('roleId').optional().isInt().withMessage('Role ID must be an integer'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

const validateGetUserById = [
    param('id').isInt().withMessage('ID must be an integer'),
];

const validateUpdateUser = [
    param('id').isInt().withMessage('ID must be an integer'),
    body('Password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('Email').optional().isEmail().withMessage('Invalid email format'),
    body('FirstName').optional().isString().withMessage('First Name must be a string'),
    body('LastName').optional().isString().withMessage('Last Name must be a string'),
    body('RoleIDs').optional().isArray().withMessage('Role IDs must be an array'),
    body('RoleIDs.*').optional().isInt().withMessage('Each Role ID must be an integer'),
];

const validateDeleteUser = [
    param('id').isInt().withMessage('ID must be an integer'),
];

module.exports = {
    validateRegisterUser,
    validateLoginUser,
    validateGetAllUsers,
    validateGetUserById,
    validateUpdateUser,
    validateDeleteUser,
};