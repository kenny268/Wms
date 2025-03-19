const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
    validateCreateShipment,
    validateGetAllShipments,
    validateGetShipmentById,
    validateUpdateShipment,
    validateDeleteShipment,
    validateAddLineItemToShipment,
    validateGetAllShipmentLineItems,
    validateGetShipmentLineItemById,
    validateUpdateShipmentLineItem,
    validateDeleteShipmentLineItem,
} = require('../validations/shipmentValidators');
const {
    handleValidationErrors,
    createShipment,
    getAllShipments,
    getShipmentById,
    updateShipment,
    deleteShipment,
    addLineItemToShipment,
    getAllShipmentLineItems,
    getShipmentLineItemById,
    updateShipmentLineItem,
    deleteShipmentLineItem,
} = require('../controllers/shipmentController');

// Create a new shipment
router.post('/api/shipments', authenticateToken, authorizeRole(['warehouse', 'admin']), validateCreateShipment, handleValidationErrors, createShipment);

// Get all shipments with optional filters and pagination
router.get('/api/shipments', authenticateToken, authorizeRole(['viewer', 'warehouse', 'sales', 'admin']), validateGetAllShipments, handleValidationErrors, getAllShipments);

// Get a specific shipment by ID
router.get('/api/shipments/:id', authenticateToken, authorizeRole(['viewer', 'warehouse', 'sales', 'admin']), validateGetShipmentById, handleValidationErrors, getShipmentById);

// Update an existing shipment
router.put('/api/shipments/:id', authenticateToken, authorizeRole(['warehouse', 'admin']), validateUpdateShipment, handleValidationErrors, updateShipment);

// Delete a shipment
router.delete('/api/shipments/:id', authenticateToken, authorizeRole(['admin']), validateDeleteShipment, handleValidationErrors, deleteShipment);

// Add a new line item to an existing shipment
router.post('/api/shipments/:shipmentId/line-items', authenticateToken, authorizeRole(['warehouse', 'admin']), validateAddLineItemToShipment, handleValidationErrors, addLineItemToShipment);

// Get all line items for a specific shipment
router.get('/api/shipments/:shipmentId/line-items', authenticateToken, authorizeRole(['viewer', 'warehouse', 'sales', 'admin']), validateGetAllShipmentLineItems, handleValidationErrors, getAllShipmentLineItems);

// Get a specific shipment line item by ID
router.get('/api/shipments/line-items/:lineItemId', authenticateToken, authorizeRole(['viewer', 'warehouse', 'sales', 'admin']), validateGetShipmentLineItemById, handleValidationErrors, getShipmentLineItemById);

// Update an existing shipment line item
router.put('/api/shipments/line-items/:lineItemId', authenticateToken, authorizeRole(['warehouse', 'admin']), validateUpdateShipmentLineItem, handleValidationErrors, updateShipmentLineItem);

// Delete a specific shipment line item
router.delete('/api/shipments/line-items/:lineItemId', authenticateToken, authorizeRole(['warehouse', 'admin']), validateDeleteShipmentLineItem, handleValidationErrors, deleteShipmentLineItem);

module.exports = router;