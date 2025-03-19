const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
    validateAssignRoleToUser,
    validateGetUserRoles,
    validateRemoveRoleFromUser,
    validateGetRolesForUser,
} = require('../validations/userRoleValidators');
const {
    handleValidationErrors,
    assignRoleToUser,
    getUserRoles,
    removeRoleFromUser,
    getRolesForUser,
} = require('../controllers/userRoleController');

// Assign a role to a user
router.post('/api/user-roles', authenticateToken, authorizeRole(['admin']), validateAssignRoleToUser, handleValidationErrors, assignRoleToUser);

// Get all user role assignments with optional filtering and pagination
router.get('/api/user-roles', authenticateToken, authorizeRole(['admin']), validateGetUserRoles, handleValidationErrors, getUserRoles);

// Remove a role from a user
router.delete('/api/user-roles', authenticateToken, authorizeRole(['admin']), validateRemoveRoleFromUser, handleValidationErrors, removeRoleFromUser);

// Optional: Get roles for a specific user
router.get('/api/users/:userId/roles', authenticateToken, authorizeRole(['admin']), validateGetRolesForUser, handleValidationErrors, getRolesForUser);

module.exports = router;