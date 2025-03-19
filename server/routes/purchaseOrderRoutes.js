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
const purchaseOrder = require('../controllers/purchaseOrderController');


// Routes with associated controller functions and validation
router.post('/api/purchase-orders', authenticateToken, authorizeRole(['purchaser', 'admin']), createPurchaseOrderValidationRules, purchaseOrder.createPurchaseOrder);
router.get('/api/purchase-orders', authenticateToken, authorizeRole(['viewer', 'purchaser', 'admin']), purchaseOrder.getAllPurchaseOrders);
router.get('/api/purchase-orders/:id', authenticateToken, authorizeRole(['viewer', 'purchaser', 'admin']), getPurchaseOrderByIdValidationRules, purchaseOrder.getPurchaseOrderById);
router.put('/api/purchase-orders/:id', authenticateToken, authorizeRole(['purchaser', 'admin']), updatePurchaseOrderValidationRules, purchaseOrder.updatePurchaseOrder);
router.delete('/api/purchase-orders/:id', authenticateToken, authorizeRole(['admin']), deletePurchaseOrderValidationRules, purchaseOrder.deletePurchaseOrder);

router.post('/api/purchase-orders/:purchaseOrderId/line-items', authenticateToken, authorizeRole(['purchaser', 'admin']), addLineItemToPurchaseOrderValidationRules, purchaseOrder.addLineItemToPurchaseOrder);
router.get('/api/purchase-orders/:purchaseOrderId/line-items', authenticateToken, authorizeRole(['viewer', 'purchaser', 'admin']), getPurchaseOrderLineItemsValidationRules, purchaseOrder.getAllPurchaseOrderLineItems);
router.get('/api/purchase-orders/line-items/:lineItemId', authenticateToken, authorizeRole(['viewer', 'purchaser', 'admin']), getPurchaseOrderLineItemByIdValidationRules, purchaseOrder.getPurchaseOrderLineItemById);
router.put('/api/purchase-orders/line-items/:lineItemId', authenticateToken, authorizeRole(['purchaser', 'admin']), updatePurchaseOrderLineItemValidationRules, purchaseOrder.updatePurchaseOrderLineItem);
router.delete('/api/purchase-orders/line-items/:lineItemId', authenticateToken, authorizeRole(['purchaser', 'admin']), deletePurchaseOrderLineItemValidationRules, purchaseOrder.deletePurchaseOrderLineItem);

module.exports = router;