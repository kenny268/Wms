const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
    validateCreateReturnAuthorization,
    validateGetAllReturnAuthorizations,
    validateGetReturnAuthorizationById,
    validateUpdateReturnAuthorization,
    validateDeleteReturnAuthorization,
    validateAddLineItemToReturnAuthorization,
    validateGetAllReturnAuthorizationLineItems,
    validateGetReturnAuthorizationLineItemById,
    validateUpdateReturnAuthorizationLineItem,
    validateDeleteReturnAuthorizationLineItem,
    validateReceiveReturnedItems,
} = require('../validations/returnAuthorizationValidators');
const {
    handleValidationErrors,
    createReturnAuthorization,
    getAllReturnAuthorizations,
    getReturnAuthorizationById,
    updateReturnAuthorization,
    deleteReturnAuthorization,
    addLineItemToReturnAuthorization,
    getAllReturnAuthorizationLineItems,
    getReturnAuthorizationLineItemById,
    updateReturnAuthorizationLineItem,
    deleteReturnAuthorizationLineItem,
    receiveReturnedItems,
} = require('../controllers/returnAuthorizationController');

// Create a new return authorization
router.post('/api/return-authorizations', authenticateToken, authorizeRole(['sales', 'admin']), validateCreateReturnAuthorization, handleValidationErrors, createReturnAuthorization);

// Get all return authorizations with optional filters and pagination
router.get('/api/return-authorizations', authenticateToken, authorizeRole(['viewer', 'sales', 'warehouse', 'admin']), validateGetAllReturnAuthorizations, handleValidationErrors, getAllReturnAuthorizations);

// Get a specific return authorization by ID
router.get('/api/return-authorizations/:id', authenticateToken, authorizeRole(['viewer', 'sales', 'warehouse', 'admin']), validateGetReturnAuthorizationById, handleValidationErrors, getReturnAuthorizationById);

// Update an existing return authorization
router.put('/api/return-authorizations/:id', authenticateToken, authorizeRole(['sales', 'admin']), validateUpdateReturnAuthorization, handleValidationErrors, updateReturnAuthorization);

// Delete a return authorization
router.delete('/api/return-authorizations/:id', authenticateToken, authorizeRole(['admin']), validateDeleteReturnAuthorization, handleValidationErrors, deleteReturnAuthorization);

// Add a new line item to an existing return authorization
router.post('/api/return-authorizations/:returnAuthorizationId/line-items', authenticateToken, authorizeRole(['sales', 'admin']), validateAddLineItemToReturnAuthorization, handleValidationErrors, addLineItemToReturnAuthorization);

// Get all line items for a specific return authorization
router.get('/api/return-authorizations/:returnAuthorizationId/line-items', authenticateToken, authorizeRole(['viewer', 'sales', 'warehouse', 'admin']), validateGetAllReturnAuthorizationLineItems, handleValidationErrors, getAllReturnAuthorizationLineItems);

// Get a specific return authorization line item by ID
router.get('/api/return-authorizations/line-items/:lineItemId', authenticateToken, authorizeRole(['viewer', 'sales', 'warehouse', 'admin']), validateGetReturnAuthorizationLineItemById, handleValidationErrors, getReturnAuthorizationLineItemById);

// Update an existing return authorization line item
router.put('/api/return-authorizations/line-items/:lineItemId', authenticateToken, authorizeRole(['sales', 'admin']), validateUpdateReturnAuthorizationLineItem, handleValidationErrors, updateReturnAuthorizationLineItem);

// Delete a specific return authorization line item
router.delete('/api/return-authorizations/line-items/:lineItemId', authenticateToken, authorizeRole(['sales', 'admin']), validateDeleteReturnAuthorizationLineItem, handleValidationErrors, deleteReturnAuthorizationLineItem);

// Receive returned items for a return authorization
router.post('/api/return-authorizations/:returnAuthorizationId/receive', authenticateToken, authorizeRole(['warehouse', 'admin']), validateReceiveReturnedItems, handleValidationErrors, receiveReturnedItems);

module.exports = router;