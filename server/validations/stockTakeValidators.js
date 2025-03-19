const { body, param, query } = require('express-validator');

const validateCreateStockTake = [
    body('StockTakeNumber').notEmpty().withMessage('Stock Take Number is required'),
    body('StockTakeDate').isISO8601().withMessage('Stock Take Date must be a valid date'),
    body('InitiatedByUserID').isInt().withMessage('Initiated By User ID is required'),
    body('StockTakeStatus').optional().isIn(['Pending', 'InProgress', 'Completed', 'Cancelled']).withMessage('Invalid Stock Take Status'),
    body('stockTakeItems').isArray().optional().withMessage('Stock Take Items must be an array'),
    body('stockTakeItems.*.ProductID').isInt().withMessage('Product ID in stock take item must be an integer'),
    body('stockTakeItems.*.LocationID').isInt().withMessage('Location ID in stock take item must be an integer'),
    body('stockTakeItems.*.LotNumber').notEmpty().withMessage('Lot Number in stock take item cannot be empty'),
    body('stockTakeItems.*.CountedQuantity').optional().isInt({ min: 0 }).withMessage('Counted Quantity in stock take item must be a non-negative integer'),
    body('stockTakeItems.*.AssignedToUserID').optional().isInt().withMessage('Assigned To User ID in stock take item must be an integer'),
];

const validateInitiateStockTakeFromInventory = [
    body('StockTakeNumber').notEmpty().withMessage('Stock Take Number is required'),
    body('StockTakeDate').isISO8601().withMessage('Stock Take Date must be a valid date'),
    body('InitiatedByUserID').isInt().withMessage('Initiated By User ID is required'),
    body('StockTakeStatus').optional().isIn(['Pending', 'InProgress', 'Completed', 'Cancelled']).withMessage('Invalid Stock Take Status'),
    body('filterByLocation').optional().isInt().withMessage('Filter by Location ID must be an integer'),
    body('filterByProduct').optional().isInt().withMessage('Filter by Product ID must be an integer'),
];

const validateGetAllStockTakes = [
    query('stockTakeStatus').optional().isIn(['Pending', 'InProgress', 'Completed', 'Cancelled']).withMessage('Invalid Stock Take Status'),
    query('startDate').optional().isISO8601().withMessage('Start Date must be a valid date'),
    query('endDate').optional().isISO8601().withMessage('End Date must be a valid date'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

const validateGetStockTakeById = [
    param('id').isInt().withMessage('ID must be an integer'),
];

const validateUpdateStockTake = [
    param('id').isInt().withMessage('ID must be an integer'),
    body('StockTakeStatus').optional().isIn(['Pending', 'InProgress', 'Completed', 'Cancelled']).withMessage('Invalid Stock Take Status'),
    body('EndDate').optional().isISO8601().withMessage('End Date must be a valid date'),
    body('Notes').optional().isString().withMessage('Notes must be a string'),
];

const validateDeleteStockTake = [
    param('id').isInt().withMessage('ID must be an integer'),
];

const validateAddStockTakeItem = [
    param('stockTakeId').isInt().withMessage('Stock Take ID must be an integer'),
    body('ProductID').isInt().withMessage('Product ID is required'),
    body('LocationID').isInt().withMessage('Location ID is required'),
    body('LotNumber').notEmpty().withMessage('Lot Number cannot be empty'),
    body('CountedQuantity').optional().isInt({ min: 0 }).withMessage('Counted Quantity must be a non-negative integer'),
    body('AssignedToUserID').optional().isInt().withMessage('Assigned To User ID must be an integer'),
];

const validateGetAllStockTakeItems = [
    param('stockTakeId').isInt().withMessage('Stock Take ID must be an integer'),
];

const validateGetStockTakeItemById = [
    param('itemId').isInt().withMessage('Item ID must be an integer'),
];

const validateUpdateStockTakeItem = [
    param('itemId').isInt().withMessage('Item ID must be an integer'),
    body('CountedQuantity').optional().isInt({ min: 0 }).withMessage('Counted Quantity must be a non-negative integer'),
    body('AssignedToUserID').optional().isInt().withMessage('Assigned To User ID must be an integer'),
    body('ReasonForDiscrepancy').optional().isString().withMessage('Reason For Discrepancy must be a string'),
    body('Notes').optional().isString().withMessage('Notes must be a string'),
];

const validateDeleteStockTakeItem = [
    param('itemId').isInt().withMessage('Item ID must be an integer'),
];

const validateProcessStockTake = [
    param('stockTakeId').isInt().withMessage('Stock Take ID must be an integer'),
];

module.exports = {
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
};