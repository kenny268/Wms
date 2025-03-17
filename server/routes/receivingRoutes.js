const express = require('express');
const router = express.Router();
const receivingController = require('./receivingController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
    createReceiptValidation,
    getReceiptByIdValidation,
    getAllReceiptsValidation,
    updateReceiptValidation,
    deleteReceiptValidation,
    addReceiptLineItemValidation,
    getAllReceiptLineItemsValidation,
    updateReceiptLineItemValidation,
    deleteReceiptLineItemValidation,

} = require('../validations/receivingValidation');

// Receipts routes
router.post('/receipts', authenticateToken,authorizeRole['admin','receiver'],createReceiptValidation, receivingController.createReceipt);
router.get('/receipts', authenticateToken,authorizeRole['admin','receiver','warehouse_manager'],getAllReceiptsValidation, receivingController.getAllReceipts);
router.get('/receipts/:id', authenticateToken,authorizeRole['admin','receiver','warehouse_manager'], getReceiptByIdValidation, receivingController.getReceiptById);
router.put('/receipts/:id',authenticateToken,authorizeRole['admin','receiver','warehouse_manager'], updateReceiptValidation, receivingController.updateReceipt);
router.delete('/receipts/:id',authenticateToken,authorizeRole['admin','receiver','warehouse_manager'], deleteReceiptValidation, receivingController.deleteReceipt);

// Receipt Line Items routes
router.post('/receipts/:receiptId/line-items',authenticateToken,authorizeRole['admin','receiver','warehouse_manager'], addReceiptLineItemValidation, receivingController.addReceiptLineItem);
router.get('/receipts/:receiptId/line-items', authenticateToken,authorizeRole['admin','receiver','warehouse_manager'], getAllReceiptLineItemsValidation, receivingController.getAllReceiptLineItems);
router.put('/receipts/line-items/:lineItemId', authenticateToken,authorizeRole['admin','receiver','warehouse_manager'], updateReceiptLineItemValidation, receivingController.updateReceiptLineItem);
router.delete('/receipts/line-items/:lineItemId', authenticateToken,authorizeRole['admin','receiver','warehouse_manager'], deleteReceiptLineItemValidation, receivingController.deleteReceiptLineItem);

module.exports = router;