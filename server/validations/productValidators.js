const { body, param, query } = require('express-validator');

const validateCreateProduct = [
    body('ProductName').notEmpty().withMessage('Product Name is required'),
    body('ProductCode').notEmpty().withMessage('Product Code is required'),
    body('UnitOfMeasureID').isInt().withMessage('Unit of Measure ID must be an integer'),
    body('ProductCategoryID').optional().isInt().withMessage('Product Category ID must be an integer'),
    body('Description').optional().isString().withMessage('Description must be a string'),
    body('Dimensions').optional().isString().withMessage('Dimensions must be a string'),
    body('Weight').optional().isNumeric().withMessage('Weight must be a number'),
    body('Cost').optional().isNumeric().withMessage('Cost must be a number'),
    body('Price').optional().isNumeric().withMessage('Price must be a number'),
];

const validateGetAllProducts = [
    query('category').optional().isString().withMessage('Category must be a string'),
    query('productCode').optional().isString().withMessage('Product Code must be a string'),
    query('productName').optional().isString().withMessage('Product Name must be a string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

const validateGetProductById = [
    param('id').isInt().withMessage('ID must be an integer'),
];

const validateUpdateProduct = [
    param('id').isInt().withMessage('ID must be an integer'),
    body('ProductName').optional().isString().withMessage('Product Name must be a string'),
    body('ProductCode').optional().isString().withMessage('Product Code must be a string'),
    body('UnitOfMeasureID').optional().isInt().withMessage('Unit of Measure ID must be an integer'),
    body('ProductCategoryID').optional().isInt().withMessage('Product Category ID must be an integer'),
    body('Description').optional().isString().withMessage('Description must be a string'),
    body('Dimensions').optional().isString().withMessage('Dimensions must be a string'),
    body('Weight').optional().isNumeric().withMessage('Weight must be a number'),
    body('Cost').optional().isNumeric().withMessage('Cost must be a number'),
    body('Price').optional().isNumeric().withMessage('Price must be a number'),
];

const validateDeleteProduct = [
    param('id').isInt().withMessage('ID must be an integer'),
];

module.exports = {
    validateCreateProduct,
    validateGetAllProducts,
    validateGetProductById,
    validateUpdateProduct,
    validateDeleteProduct,
};