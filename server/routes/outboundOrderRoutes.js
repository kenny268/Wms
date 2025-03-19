const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
    validateCreateOutboundOrder,
    validateGetAllOutboundOrders,
    validateGetOutboundOrderById,
    validateUpdateOutboundOrder,
    validateDeleteOutboundOrder,
    validateAddLineItemToOutboundOrder,
    validateGetAllOutboundOrderLineItems,
    validateGetOutboundOrderLineItemById,
    validateUpdateOutboundOrderLineItem,
    validateDeleteOutboundOrderLineItem,
    validateAllocateInventoryToOrder,
} = require('../validations/outboundOrderValidators');

const {
    handleValidationErrors,
    createOutboundOrder,
    getAllOutboundOrders,
    getOutboundOrderById,
    updateOutboundOrder,
    deleteOutboundOrder,
    addLineItemToOutboundOrder,
    getAllOutboundOrderLineItems,
    getOutboundOrderLineItemById,
    updateOutboundOrderLineItem,
    deleteOutboundOrderLineItem,
    allocateInventoryToOrder,
} = require('../controllers/outboundOrderController');

// Create a new outbound order
router.post('/api/outbound-orders', authenticateToken, authorizeRole(['sales', 'admin']), validateCreateOutboundOrder, handleValidationErrors, createOutboundOrder);

// Get all outbound orders with optional filters and pagination
router.get('/api/outbound-orders', authenticateToken, authorizeRole(['viewer', 'sales', 'warehouse', 'admin']), validateGetAllOutboundOrders, handleValidationErrors, getAllOutboundOrders);

// Get a specific outbound order by ID
router.get('/api/outbound-orders/:id', authenticateToken, authorizeRole(['viewer', 'sales', 'warehouse', 'admin']), validateGetOutboundOrderById, handleValidationErrors, getOutboundOrderById);

// Update an existing outbound order
router.put('/api/outbound-orders/:id', authenticateToken, authorizeRole(['sales', 'admin']), validateUpdateOutboundOrder, handleValidationErrors, updateOutboundOrder);

// Delete an outbound order
router.delete('/api/outbound-orders/:id', authenticateToken, authorizeRole(['admin']), validateDeleteOutboundOrder, handleValidationErrors, deleteOutboundOrder);

// Add a new line item to an existing outbound order
router.post('/api/outbound-orders/:orderId/line-items', authenticateToken, authorizeRole(['sales', 'admin']), validateAddLineItemToOutboundOrder, handleValidationErrors, addLineItemToOutboundOrder);

// Get all line items for a specific outbound order
router.get('/api/outbound-orders/:orderId/line-items', authenticateToken, authorizeRole(['viewer', 'sales', 'warehouse', 'admin']), validateGetAllOutboundOrderLineItems, handleValidationErrors, getAllOutboundOrderLineItems);

// Get a specific line item by ID
router.get('/api/outbound-orders/line-items/:lineItemId', authenticateToken, authorizeRole(['viewer', 'sales', 'warehouse', 'admin']), validateGetOutboundOrderLineItemById, handleValidationErrors, getOutboundOrderLineItemById);

// Update an existing outbound order line item
router.put('/api/outbound-orders/line-items/:lineItemId', authenticateToken, authorizeRole(['sales', 'admin']), validateUpdateOutboundOrderLineItem, handleValidationErrors, updateOutboundOrderLineItem);

// Delete a specific outbound order line item
router.delete('/api/outbound-orders/line-items/:lineItemId', authenticateToken, authorizeRole(['sales', 'admin']), validateDeleteOutboundOrderLineItem, handleValidationErrors, deleteOutboundOrderLineItem);

// Allocate inventory to an outbound order
router.post('/api/outbound-orders/:orderId/allocate', authenticateToken, authorizeRole(['warehouse', 'admin']), validateAllocateInventoryToOrder, handleValidationErrors, allocateInventoryToOrder);

module.exports = router;