// validations/unitOfMeasureValidation.js
const { body, param } = require('express-validator');

const validateCreateUnitOfMeasure = [
    body('UOMName').isString().withMessage('Unit of Measure Name must be a string'),
    body('UOMCode').isString().withMessage('Unit of Measure Code must be a string'),
    body('Description').optional().isString().withMessage('Description must be a string'),
];

const validateGetUnitOfMeasureById = [
    param('id').isInt().withMessage('ID must be an integer'),
];

const validateUpdateUnitOfMeasure = [
    param('id').isInt().withMessage('ID must be an integer'),
    body('UOMName').optional().isString().withMessage('Unit of Measure Name must be a string'),
    body('UOMCode').optional().isString().withMessage('Unit of Measure Code must be a string'),
    body('Description').optional().isString().withMessage('Description must be a string'),
];

const validateDeleteUnitOfMeasure = [
    param('id').isInt().withMessage('ID must be an integer'),
];

module.exports = {
    validateCreateUnitOfMeasure,
    validateGetUnitOfMeasureById,
    validateUpdateUnitOfMeasure,
    validateDeleteUnitOfMeasure,
};