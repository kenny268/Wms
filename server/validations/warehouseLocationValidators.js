const { body, param, query } = require('express-validator');
const { WarehouseLocation } = require('../models'); // Import the model

const allowedLocationTypes = ['Warehouse', 'Zone', 'Aisle', 'Rack', 'Shelf', 'Bin', 'Chamber', 'Other'];

const validateCreateWarehouseLocation = [
    body('LocationCode').notEmpty().withMessage('Location Code is required'),
    body('LocationName').optional().isString().withMessage('Location Name must be a string'),
    body('LocationType').notEmpty().isIn(allowedLocationTypes).withMessage(`Location Type must be one of: ${allowedLocationTypes.join(', ')}`),
    body('ParentLocationID').optional().isInt().withMessage('Parent Location ID must be an integer'),
    body('Capacity').optional().isInt({ min: 0 }).withMessage('Capacity must be a non-negative integer'),
    body('Notes').optional().isString().withMessage('Notes must be a string'),
];

const validateGetAllWarehouseLocations = [
    query('locationCode').optional().isString().withMessage('Location Code must be a string'),
    query('locationType').optional().isIn(allowedLocationTypes).withMessage(`Location Type must be one of: ${allowedLocationTypes.join(', ')}`),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

const validateGetWarehouseLocationById = [
    param('id').isInt().withMessage('ID must be an integer'),
];

const validateUpdateWarehouseLocation = [
    param('id').isInt().withMessage('ID must be an integer'),
    body('LocationCode').optional().isString().withMessage('Location Code must be a string'),
    body('LocationName').optional().isString().withMessage('Location Name must be a string'),
    body('LocationType').optional().isIn(allowedLocationTypes).withMessage(`Location Type must be one of: ${allowedLocationTypes.join(', ')}`),
    body('ParentLocationID').optional().isInt().withMessage('Parent Location ID must be an integer'),
    body('Capacity').optional().isInt({ min: 0 }).withMessage('Capacity must be a non-negative integer'),
    body('Notes').optional().isString().withMessage('Notes must be a string'),
];

const validateDeleteWarehouseLocation = [
    param('id').isInt().withMessage('ID must be an integer'),
];

module.exports = {
    validateCreateWarehouseLocation,
    validateGetAllWarehouseLocations,
    validateGetWarehouseLocationById,
    validateUpdateWarehouseLocation,
    validateDeleteWarehouseLocation,
};