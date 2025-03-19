const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const {
    validateGetAllStockMovements,
    validateGetStockMovementById,
    validateInventoryAdjustment,
    validateStockTransfer

} = require('../validations/stockMovementValidators')

const {
    createStockTransfer,
    createInventoryAdjustment,
    getAllStockMovements,
    getStockMovementById
    
} = require('../controllers/stockMovementController')
// Routes
router.post('/api/stock-movements/transfer', authenticateToken, authorizeRole(['warehouse', 'admin']), validateStockTransfer, createStockTransfer);

router.post('/api/stock-movements/adjustment', authenticateToken, authorizeRole(['warehouse', 'admin']),validateInventoryAdjustment, createInventoryAdjustment);

router.get('/api/stock-movements', authenticateToken, authorizeRole(['viewer', 'warehouse', 'admin']), validateGetAllStockMovements, getAllStockMovements);

router.get('/api/stock-movements/:id', authenticateToken, authorizeRole(['viewer', 'warehouse', 'admin']),validateGetStockMovementById, getStockMovementById);

module.exports = router;