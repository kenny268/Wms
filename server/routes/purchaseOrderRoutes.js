const express = require('express');
const router = express.Router();

const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { 
    createPurchaseOrderValidationRules, 
    updatePurchaseOrderValidationRules,
    deletePurchaseOrderValidationRules, 
    getPurchaseOrderByIdValidationRules,
    addLineItemToPurchaseOrderValidationRules,
    getPurchaseOrderLineItemsValidationRules,
    getPurchaseOrderLineItemByIdValidationRules,
    updatePurchaseOrderLineItemValidationRules,
    deletePurchaseOrderLineItemValidationRules,
    addLineItemToPurchaseOrder,
    getAllPurchaseOrderLineItems,
    getPurchaseOrderLineItemById,
    updatePurchaseOrderLineItem,
    deletePurchaseOrderLineItem
    
 } = require('../validations/purchaseOrderValidation');
const { createPurchaseOrder, getAllPurchaseOrders, getPurchaseOrderById, updatePurchaseOrder, deletePurchaseOrder } = require('../controllers/purchaseOrderController');


// Routes with associated controller functions and validation
router.post('/api/purchase-orders', authenticateToken, authorizeRole(['purchaser', 'admin']), createPurchaseOrderValidationRules, createPurchaseOrder);
router.get('/api/purchase-orders', authenticateToken, authorizeRole(['viewer', 'purchaser', 'admin']), getAllPurchaseOrders);
router.get('/api/purchase-orders/:id', authenticateToken, authorizeRole(['viewer', 'purchaser', 'admin']), getPurchaseOrderByIdValidationRules, getPurchaseOrderById);
router.put('/api/purchase-orders/:id', authenticateToken, authorizeRole(['purchaser', 'admin']), updatePurchaseOrderValidationRules, updatePurchaseOrder);
router.delete('/api/purchase-orders/:id', authenticateToken, authorizeRole(['admin']), deletePurchaseOrderValidationRules, deletePurchaseOrder);

router.post('/api/purchase-orders/:purchaseOrderId/line-items', authenticateToken, authorizeRole(['purchaser', 'admin']), addLineItemToPurchaseOrderValidationRules, addLineItemToPurchaseOrder);
router.get('/api/purchase-orders/:purchaseOrderId/line-items', authenticateToken, authorizeRole(['viewer', 'purchaser', 'admin']), getPurchaseOrderLineItemsValidationRules, getAllPurchaseOrderLineItems);
router.get('/api/purchase-orders/line-items/:lineItemId', authenticateToken, authorizeRole(['viewer', 'purchaser', 'admin']), getPurchaseOrderLineItemByIdValidationRules, getPurchaseOrderLineItemById);
router.put('/api/purchase-orders/line-items/:lineItemId', authenticateToken, authorizeRole(['purchaser', 'admin']), updatePurchaseOrderLineItemValidationRules, updatePurchaseOrderLineItem);
router.delete('/api/purchase-orders/line-items/:lineItemId', authenticateToken, authorizeRole(['purchaser', 'admin']), deletePurchaseOrderLineItemValidationRules, deletePurchaseOrderLineItem);

module.exports = router;