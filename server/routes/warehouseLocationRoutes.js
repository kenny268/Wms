const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
    validateCreateWarehouseLocation,
    validateGetAllWarehouseLocations,
    validateGetWarehouseLocationById,
    validateUpdateWarehouseLocation,
    validateDeleteWarehouseLocation,
} = require('../validations/warehouseLocationValidators');
const {
    handleValidationErrors,
    createWarehouseLocation,
    getAllWarehouseLocations,
    getWarehouseLocationById,
    updateWarehouseLocation,
    deleteWarehouseLocation,
} = require('../controllers/warehouseLocationController');

// Create a new warehouse location
router.post('/api/warehouse-locations', authenticateToken, authorizeRole(['admin', 'warehouse']), validateCreateWarehouseLocation, handleValidationErrors, createWarehouseLocation);

// Get all warehouse locations with optional filtering and pagination
router.get('/api/warehouse-locations', authenticateToken, authorizeRole(['viewer', 'warehouse', 'admin']), validateGetAllWarehouseLocations, handleValidationErrors, getAllWarehouseLocations);

// Get a specific warehouse location by ID
router.get('/api/warehouse-locations/:id', authenticateToken, authorizeRole(['viewer', 'warehouse', 'admin']), validateGetWarehouseLocationById, handleValidationErrors, getWarehouseLocationById);

// Update an existing warehouse location
router.put('/api/warehouse-locations/:id', authenticateToken, authorizeRole(['admin', 'warehouse']), validateUpdateWarehouseLocation, handleValidationErrors, updateWarehouseLocation);

// Delete a warehouse location
router.delete('/api/warehouse-locations/:id', authenticateToken, authorizeRole(['admin']), validateDeleteWarehouseLocation, handleValidationErrors, deleteWarehouseLocation);

module.exports = router;