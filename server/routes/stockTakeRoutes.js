const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
    validateCreateStockTake,
    validateInitiateStockTakeFromInventory,
    validateGetAllStockTakes,
    validateGetStockTakeById,
    validateUpdateStockTake,
    validateDeleteStockTake,
    validateAddStockTakeItem,
    validateGetAllStockTakeItems,
    validateGetStockTakeItemById,
    validateUpdateStockTakeItem,
    validateDeleteStockTakeItem,
    validateProcessStockTake,
} = require('../validations/stockTakeValidators');
const {
    handleValidationErrors,
    createStockTake,
    initiateStockTakeFromInventory,
    getAllStockTakes,
    getStockTakeById,
    updateStockTake,
    deleteStockTake,
    addStockTakeItem,
    getAllStockTakeItems,
    getStockTakeItemById,
    updateStockTakeItem,
    deleteStockTakeItem,
    processStockTake,
} = require('../controllers/stockTakeController');

// Create a new stock take (with optional initial items)
router.post('/api/stock-takes', authenticateToken, authorizeRole(['warehouse', 'admin']), validateCreateStockTake, handleValidationErrors, createStockTake);

// Initiate a stock take from current inventory (with optional filters)
router.post('/api/stock-takes/initiate', authenticateToken, authorizeRole(['warehouse', 'admin']), validateInitiateStockTakeFromInventory, handleValidationErrors, initiateStockTakeFromInventory);

// Get all stock takes with optional filters and pagination
router.get('/api/stock-takes', authenticateToken, authorizeRole(['viewer', 'warehouse', 'admin']), validateGetAllStockTakes, handleValidationErrors, getAllStockTakes);

// Get a specific stock take by ID
router.get('/api/stock-takes/:id', authenticateToken, authorizeRole(['viewer', 'warehouse', 'admin']), validateGetStockTakeById, handleValidationErrors, getStockTakeById);

// Update an existing stock take
router.put('/api/stock-takes/:id', authenticateToken, authorizeRole(['warehouse', 'admin']), validateUpdateStockTake, handleValidationErrors, updateStockTake);

// Delete a stock take
router.delete('/api/stock-takes/:id', authenticateToken, authorizeRole(['admin']), validateDeleteStockTake, handleValidationErrors, deleteStockTake);

// Add a new item to an existing stock take
router.post('/api/stock-takes/:stockTakeId/items', authenticateToken, authorizeRole(['warehouse', 'admin']), validateAddStockTakeItem, handleValidationErrors, addStockTakeItem);

// Get all items for a specific stock take
router.get('/api/stock-takes/:stockTakeId/items', authenticateToken, authorizeRole(['viewer', 'warehouse', 'admin']), validateGetAllStockTakeItems, handleValidationErrors, getAllStockTakeItems);

// Get a specific stock take item by ID
router.get('/api/stock-takes/items/:itemId', authenticateToken, authorizeRole(['viewer', 'warehouse', 'admin']), validateGetStockTakeItemById, handleValidationErrors, getStockTakeItemById);

// Update an existing stock take item
router.put('/api/stock-takes/items/:itemId', authenticateToken, authorizeRole(['warehouse', 'admin']), validateUpdateStockTakeItem, handleValidationErrors, updateStockTakeItem);

// Delete a specific stock take item
router.delete('/api/stock-takes/items/:itemId', authenticateToken, authorizeRole(['warehouse', 'admin']), validateDeleteStockTakeItem, handleValidationErrors, deleteStockTakeItem);

// Process a stock take (compare counted quantities with expected/system quantities and update inventory)
router.post('/api/stock-takes/:stockTakeId/process', authenticateToken, authorizeRole(['warehouse', 'admin']), validateProcessStockTake, handleValidationErrors, processStockTake);

module.exports = router;