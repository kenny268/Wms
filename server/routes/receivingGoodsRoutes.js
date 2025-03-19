const express = require('express');
const router = express.Router();
const receivingGoodsController = require('../controllers/receivingGoodsController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
    validateCreateReceipt,
    validateAddLineItemToReceipt,
    validateReceiveReceipt,
    validateGetAllReceipts,
    validateGetReceiptById,
    validateUpdateReceipt,
    validateCancelReceipt,
    validateDeleteReceipt,
} = require('../validations/receivingGoodsValidators');
const { handleValidationErrors } = require('../utils/utils'); // Assuming you have a general validation error handler

// Create a new draft receipt
router.post('/api/receiving/receipts', authenticateToken, authorizeRole(['admin', 'warehouse']), validateCreateReceipt, handleValidationErrors, receivingGoodsController.createReceipt);

// Add line items to an existing draft receipt
router.post('/api/receiving/receipts/:receiptId/items', authenticateToken, authorizeRole(['admin', 'warehouse']), validateAddLineItemToReceipt, handleValidationErrors, receivingGoodsController.addLineItemToReceipt);

// Finalize a draft receipt (set status to "Received" and potentially update inventory)
router.post('/api/receiving/receipts/:receiptId/receive', authenticateToken, authorizeRole(['admin', 'warehouse']), validateReceiveReceipt, handleValidationErrors, receivingGoodsController.receiveReceipt);

router.get('/api/receiving/receipts', authenticateToken, authorizeRole(['viewer', 'warehouse', 'admin']), validateGetAllReceipts, handleValidationErrors, receivingGoodsController.getAllReceipts);

router.get('/api/receiving/receipts/:id', authenticateToken, authorizeRole(['viewer', 'warehouse', 'admin']), validateGetReceiptById, handleValidationErrors, receivingGoodsController.getReceiptById);

// Update a draft receipt's header information
router.put('/api/receiving/receipts/:id', authenticateToken, authorizeRole(['admin', 'warehouse']), validateUpdateReceipt, handleValidationErrors, receivingGoodsController.updateReceipt);

// Cancel a draft receipt
router.put('/api/receiving/receipts/:id/cancel', authenticateToken, authorizeRole(['admin', 'warehouse']), validateCancelReceipt, handleValidationErrors, receivingGoodsController.cancelReceipt);

// Delete a draft receipt
router.delete('/api/receiving/receipts/:id', authenticateToken, authorizeRole(['admin']), validateDeleteReceipt, handleValidationErrors, receivingGoodsController.deleteReceipt);

module.exports = router;