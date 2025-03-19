const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
    validateCreateSupplier,
    validateGetAllSuppliers,
    validateGetSupplierById,
    validateUpdateSupplier,
    validateDeleteSupplier,
} = require('../validations/supplierValidators');
const {
    handleValidationErrors,
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
} = require('../controllers/supplierController');

// Create a new supplier
router.post('/api/suppliers', authenticateToken, authorizeRole(['admin', 'warehouse']), validateCreateSupplier, handleValidationErrors, createSupplier);

// Get all suppliers with optional filtering and pagination
router.get('/api/suppliers', authenticateToken, authorizeRole(['viewer', 'warehouse', 'admin']), validateGetAllSuppliers, handleValidationErrors, getAllSuppliers);

// Get a specific supplier by ID
router.get('/api/suppliers/:id', authenticateToken, authorizeRole(['viewer', 'warehouse', 'admin']), validateGetSupplierById, handleValidationErrors, getSupplierById);

// Update an existing supplier
router.put('/api/suppliers/:id', authenticateToken, authorizeRole(['admin', 'warehouse']), validateUpdateSupplier, handleValidationErrors, updateSupplier);

// Delete a supplier
router.delete('/api/suppliers/:id', authenticateToken, authorizeRole(['admin']), validateDeleteSupplier, handleValidationErrors, deleteSupplier);

module.exports = router;