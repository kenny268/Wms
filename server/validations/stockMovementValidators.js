const { body, param, query } = require('express-validator');

exports.validateStockTransfer = [
    body('ProductID').isInt().withMessage('Product ID is required'),
    body('FromLocationID').isInt().withMessage('From Location ID is required'),
    body('ToLocationID').isInt().withMessage('To Location ID is required'),
    body('Quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    body('UserID').isInt().withMessage('User ID is required'),
    body('ProductLotID').optional().isInt().withMessage('Product Lot ID must be an integer'),
    body('Reason').optional().notEmpty().withMessage('Reason cannot be empty'),
];

exports.validateInventoryAdjustment = [
    body('ProductID').isInt().withMessage('Product ID is required'),
    body('LocationID').isInt().withMessage('Location ID is required'),
    body('Quantity').isInt().withMessage('Quantity must be an integer'),
    body('UserID').isInt().withMessage('User ID is required'),
    body('ProductLotID').optional().isInt().withMessage('Product Lot ID must be an integer'),
    body('Reason').notEmpty().withMessage('Reason is required for adjustments'),
];

exports.validateGetAllStockMovements = [
    query('productId').optional().isInt().withMessage('Product ID must be an integer'),
    query('fromLocationId').optional().isInt().withMessage('From Location ID must be an integer'),
    query('toLocationId').optional().isInt().withMessage('To Location ID must be an integer'),
    query('movementType').optional().isIn(['Transfer', 'Adjustment']).withMessage('Movement Type must be Transfer or Adjustment'),
    query('startDate').optional().isISO8601().withMessage('Start Date must be a valid date'),
    query('endDate').optional().isISO8601().withMessage('End Date must be a valid date'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

exports.validateGetStockMovementById = [
    param('id').isInt().withMessage('Stock Movement ID must be an integer'),
];
