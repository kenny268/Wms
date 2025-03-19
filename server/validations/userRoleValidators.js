const { body, param, query } = require('express-validator');

const validateAssignRoleToUser = [
    body('UserID').isInt().withMessage('User ID must be an integer'),
    body('RoleID').isInt().withMessage('Role ID must be an integer'),
];

const validateGetUserRoles = [
    query('userId').optional().isInt().withMessage('User ID must be an integer'),
    query('roleId').optional().isInt().withMessage('Role ID must be an integer'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

const validateRemoveRoleFromUser = [
    body('UserID').isInt().withMessage('User ID must be an integer'),
    body('RoleID').isInt().withMessage('Role ID must be an integer'),
];

const validateGetRolesForUser = [
    param('userId').isInt().withMessage('User ID must be an integer'),
];

module.exports = {
    validateAssignRoleToUser,
    validateGetUserRoles,
    validateRemoveRoleFromUser,
    validateGetRolesForUser,
};