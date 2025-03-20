const express = require('express');
const router = express.Router();

const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { param, query, body } = require('express-validator');
const { getAllInventory, getInventoryById, getInventoryByProductId, getInventoryByLocationId, getInventoryByLotNumber, updateInventoryQuantity } = require('../controllers/inventoryController');


// Routes
router.get('/api/inventory', authenticateToken, authorizeRole(['viewer', 'warehouse', 'admin']), [
    query('productId').optional().isInt().withMessage('Product ID must be an integer'),
    query('locationId').optional().isInt().withMessage('Location ID must be an integer'),
    query('lotNumber').optional().notEmpty().withMessage('Lot Number cannot be empty'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
], getAllInventory);

router.get('/api/inventory/:inventoryId', authenticateToken, authorizeRole(['viewer', 'warehouse', 'admin']), param('inventoryId').isInt().withMessage('Inventory ID must be an integer'), getInventoryById);
router.get('/api/inventory/product/:productId', authenticateToken, authorizeRole(['viewer', 'warehouse', 'admin']), param('productId').isInt().withMessage('Product ID must be an integer'), getInventoryByProductId);
router.get('/api/inventory/location/:locationId', authenticateToken, authorizeRole(['viewer', 'warehouse', 'admin']), param('locationId').isInt().withMessage('Location ID must be an integer'), getInventoryByLocationId);
router.get('/api/inventory/lot/:lotNumber', authenticateToken, authorizeRole(['viewer', 'warehouse', 'admin']), param('lotNumber').notEmpty().withMessage('Lot Number cannot be empty'), getInventoryByLotNumber);

// Potential route for triggering a manual inventory update (use with caution)
router.put('/api/inventory/:inventoryId', authenticateToken, authorizeRole(['admin']), param('inventoryId').isInt().withMessage('Inventory ID must be an integer'), [
    body('quantityOnHand').isInt().withMessage('Quantity on Hand must be an integer'),
], updateInventoryQuantity);

module.exports = router;