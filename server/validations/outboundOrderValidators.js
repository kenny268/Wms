const { body, param, query } = require('express-validator');

const validateCreateOutboundOrder = [
    body('OrderNumber').notEmpty().withMessage('Order Number is required'),
    body('CustomerID').isInt().withMessage('Customer ID must be an integer'),
    body('OrderDate').isISO8601().withMessage('Order Date must be a valid date'),
    body('ShippingAddressID').isInt().withMessage('Shipping Address ID must be an integer'),
    body('BillingAddressID').isInt().withMessage('Billing Address ID must be an integer'),
    body('ShippingMethod').notEmpty().withMessage('Shipping Method is required'),
    body('OrderCreatedByUserID').isInt().withMessage('Order Created By User ID must be an integer'),
    body('OrderStatus').optional().isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']).withMessage('Invalid Order Status'),
    body('lineItems').isArray().optional().withMessage('Line Items must be an array'),
    body('lineItems.*.ProductID').isInt().withMessage('Product ID in line item must be an integer'),
    body('lineItems.*.QuantityOrdered').isInt({ min: 1 }).withMessage('Quantity Ordered in line item must be a positive integer'),
    body('lineItems.*.UnitOfMeasure').notEmpty().withMessage('Unit of Measure in line item is required'),
    body('lineItems.*.PricePerUnit').isNumeric().withMessage('Price Per Unit in line item must be a number'),
];

const validateGetAllOutboundOrders = [
    query('customerId').optional().isInt().withMessage('Customer ID must be an integer'),
    query('orderStatus').optional().isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']).withMessage('Invalid Order Status'),
    query('startDate').optional().isISO8601().withMessage('Start Date must be a valid date'),
    query('endDate').optional().isISO8601().withMessage('End Date must be a valid date'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

const validateGetOutboundOrderById = [
    param('id').isInt().withMessage('ID must be an integer'),
];

const validateUpdateOutboundOrder = [
    param('id').isInt().withMessage('ID must be an integer'),
    body('OrderStatus').optional().isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']).withMessage('Invalid Order Status'),
    // Add other fields that can be updated with their validation rules
    body('ExpectedShipDate').optional().isISO8601().withMessage('Expected Ship Date must be a valid date'),
    body('Notes').optional().isString().withMessage('Notes must be a string'),
    body('ShippingMethod').optional().isString().withMessage('Shipping Method must be a string'),
    body('ShippingAddressID').optional().isInt().withMessage('Shipping Address ID must be an integer'),
    body('BillingAddressID').optional().isInt().withMessage('Billing Address ID must be an integer'),
];

const validateDeleteOutboundOrder = [
    param('id').isInt().withMessage('ID must be an integer'),
];

const validateAddLineItemToOutboundOrder = [
    param('orderId').isInt().withMessage('Order ID must be an integer'),
    body('ProductID').isInt().withMessage('Product ID is required'),
    body('QuantityOrdered').isInt({ min: 1 }).withMessage('Quantity Ordered must be a positive integer'),
    body('UnitOfMeasure').notEmpty().withMessage('Unit of Measure is required'),
    body('PricePerUnit').isNumeric().withMessage('Price Per Unit must be a number'),
];

const validateGetAllOutboundOrderLineItems = [
    param('orderId').isInt().withMessage('Order ID must be an integer'),
];

const validateGetOutboundOrderLineItemById = [
    param('lineItemId').isInt().withMessage('Line Item ID must be an integer'),
];

const validateUpdateOutboundOrderLineItem = [
    param('lineItemId').isInt().withMessage('Line Item ID must be an integer'),
    body('QuantityOrdered').optional().isInt({ min: 1 }).withMessage('Quantity Ordered must be a positive integer'),
    body('UnitOfMeasure').optional().notEmpty().withMessage('Unit of Measure is required'),
    body('PricePerUnit').optional().isNumeric().withMessage('Price Per Unit must be a number'),
];

const validateDeleteOutboundOrderLineItem = [
    param('lineItemId').isInt().withMessage('Line Item ID must be an integer'),
];

const validateAllocateInventoryToOrder = [
    param('orderId').isInt().withMessage('Order ID must be an integer'),
];

module.exports = {
    validateCreateOutboundOrder,
    validateGetAllOutboundOrders,
    validateGetOutboundOrderById,
    validateUpdateOutboundOrder,
    validateDeleteOutboundOrder,
    validateAddLineItemToOutboundOrder,
    validateGetAllOutboundOrderLineItems,
    validateGetOutboundOrderLineItemById,
    validateUpdateOutboundOrderLineItem,
    validateDeleteOutboundOrderLineItem,
    validateAllocateInventoryToOrder,
};