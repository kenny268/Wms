const { body, param, query } = require('express-validator');

const validateCreateRole = [
    body('RoleName').notEmpty().withMessage('Role Name is required'),
    body('Description').optional().isString().withMessage('Description must be a string'),
];

const validateGetAllRoles = [
    query('roleName').optional().isString().withMessage('Role Name must be a string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

const validateGetRoleById = [
    param('id').isInt().withMessage('ID must be an integer'),
];

const validateUpdateRole = [
    param('id').isInt().withMessage('ID must be an integer'),
    body('RoleName').optional().isString().withMessage('Role Name must be a string'),
    body('Description').optional().isString().withMessage('Description must be a string'),
];

const validateDeleteRole = [
    param('id').isInt().withMessage('ID must be an integer'),
];

module.exports = {
    validateCreateRole,
    validateGetAllRoles,
    validateGetRoleById,
    validateUpdateRole,
    validateDeleteRole,
};