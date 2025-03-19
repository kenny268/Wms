const { body, param, query } = require('express-validator');

const validateCreateSupplier = [
    body('CompanyName').notEmpty().withMessage('Supplier Name is required'),
    body('ContactName').optional().notEmpty().withMessage('Contact Person cannot be empty'),
    body('Email').optional().isEmail().withMessage('Invalid email format'),
    body('Phone').optional().notEmpty().withMessage('Phone number cannot be empty'),
    body('AddressID').optional().isInt().withMessage('Address ID must be an integer'), // Assuming AddressID is used
    // If City and Country are directly in the Supplier model (contrary to the provided model):
    // body('City').optional().notEmpty().withMessage('City cannot be empty'),
    // body('Country').optional().notEmpty().withMessage('Country cannot be empty'),
    body('ContactTitle').optional().isString().withMessage('Contact Title must be a string'),
    body('Fax').optional().isString().withMessage('Fax must be a string'),
    body('HomePage').optional().isURL().withMessage('Invalid URL format for Home Page'),
];

const validateGetAllSuppliers = [
    query('supplierName').optional().notEmpty().withMessage('Supplier Name cannot be empty'),
    query('city').optional().notEmpty().withMessage('City cannot be empty'),
    query('country').optional().notEmpty().withMessage('Country cannot be empty'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

const validateGetSupplierById = [
    param('id').isInt().withMessage('ID must be an integer'),
];

const validateUpdateSupplier = [
    param('id').isInt().withMessage('ID must be an integer'),
    body('CompanyName').optional().notEmpty().withMessage('Supplier Name cannot be empty'),
    body('ContactName').optional().notEmpty().withMessage('Contact Person cannot be empty'),
    body('Email').optional().isEmail().withMessage('Invalid email format'),
    body('Phone').optional().notEmpty().withMessage('Phone number cannot be empty'),
    body('AddressID').optional().isInt().withMessage('Address ID must be an integer'), // Assuming AddressID is used
    // If City and Country are directly in the Supplier model:
    // body('City').optional().notEmpty().withMessage('City cannot be empty'),
    // body('Country').optional().notEmpty().withMessage('Country cannot be empty'),
    body('ContactTitle').optional().isString().withMessage('Contact Title must be a string'),
    body('Fax').optional().isString().withMessage('Fax must be a string'),
    body('HomePage').optional().isURL().withMessage('Invalid URL format for Home Page'),
];

const validateDeleteSupplier = [
    param('id').isInt().withMessage('ID must be an integer'),
];

module.exports = {
    validateCreateSupplier,
    validateGetAllSuppliers,
    validateGetSupplierById,
    validateUpdateSupplier,
    validateDeleteSupplier,
};