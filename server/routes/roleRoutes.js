const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
    validateCreateRole,
    validateGetAllRoles,
    validateGetRoleById,
    validateUpdateRole,
    validateDeleteRole,
} = require('../validations/roleValidators');
const {
    handleValidationErrors,
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
} = require('../controllers/roleController');

// Create a new role
router.post('/api/roles', authenticateToken, authorizeRole(['admin']), validateCreateRole, handleValidationErrors, createRole);

// Get all roles with optional filtering and pagination
router.get('/api/roles', authenticateToken, authorizeRole(['admin']), validateGetAllRoles, handleValidationErrors, getAllRoles);

// Get a specific role by ID
router.get('/api/roles/:id', authenticateToken, authorizeRole(['admin']), validateGetRoleById, handleValidationErrors, getRoleById);

// Update an existing role
router.put('/api/roles/:id', authenticateToken, authorizeRole(['admin']), validateUpdateRole, handleValidationErrors, updateRole);

// Delete a role
router.delete('/api/roles/:id', authenticateToken, authorizeRole(['admin']), validateDeleteRole, handleValidationErrors, deleteRole);

module.exports = router;