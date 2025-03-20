// routes/unitOfMeasureRoutes.js
const express = require('express');
const router = express.Router();
const unitOfMeasureController = require('../controllers/unitOfMeasureController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../utils/utils');
const {
    validateCreateUnitOfMeasure,
    validateGetUnitOfMeasureById,
    validateUpdateUnitOfMeasure,
    validateDeleteUnitOfMeasure,
} = require('../validations/unitOfMeasureValidation');

// Create a new unit of measure
router.post('/api/unit-of-measures', authenticateToken, validateCreateUnitOfMeasure, handleValidationErrors, unitOfMeasureController.createUnitOfMeasure);

// Get all units of measure
router.get('/api/unit-of-measures', authenticateToken, unitOfMeasureController.getAllUnitsOfMeasure);

// Get a specific unit of measure by ID
router.get('/api/unit-of-measures/:id', authenticateToken, validateGetUnitOfMeasureById, handleValidationErrors, unitOfMeasureController.getUnitOfMeasureById);

// Update a unit of measure by ID
router.put('/api/unit-of-measures/:id', authenticateToken, validateUpdateUnitOfMeasure, handleValidationErrors, unitOfMeasureController.updateUnitOfMeasure);

// Delete a unit of measure by ID
router.delete('/api/unit-of-measures/:id', authenticateToken, validateDeleteUnitOfMeasure, handleValidationErrors, unitOfMeasureController.deleteUnitOfMeasure);

module.exports = router;