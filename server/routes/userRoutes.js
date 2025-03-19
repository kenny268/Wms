const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { registerLimiter,loginLimiter } = require('../utils/utils')

const {
    validateRegisterUser,
    validateLoginUser,
    validateGetAllUsers,
    validateGetUserById,
    validateUpdateUser,
    validateDeleteUser,
} = require('../validations/userValidators');

const {
    handleValidationErrors,
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require('../controllers/userController');

// Public registration endpoint
router.post('/api/users/register', registerLimiter, validateRegisterUser, handleValidationErrors, registerUser);

// Public login endpoint
router.post('/api/users/login', loginLimiter, validateLoginUser, handleValidationErrors, loginUser);

// Protected route to get all users (Admin only)
router.get('/api/users', authenticateToken, authorizeRole(['admin']), validateGetAllUsers, handleValidationErrors, getAllUsers);

// Protected route to get a user by ID (Admin only)
router.get('/api/users/:id', authenticateToken, authorizeRole(['admin']), validateGetUserById, handleValidationErrors, getUserById);

// Protected route to update a user by ID (Admin only)
router.put('/api/users/:id', authenticateToken, authorizeRole(['admin']), validateUpdateUser, handleValidationErrors, updateUser);

// Protected route to delete a user by ID (Admin only)
router.delete('/api/users/:id', authenticateToken, authorizeRole(['admin']), validateDeleteUser, handleValidationErrors, deleteUser);

module.exports = router;