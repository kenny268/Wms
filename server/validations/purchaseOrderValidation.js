const { body, param, validationResult, query } = require('express-validator'); 

// Validation rules (retained and updated with query params)
exports.createPurchaseOrderValidationRules = [
    body('PONumber').notEmpty().withMessage('PO Number is required'),
    body('SupplierID').isInt().withMessage('Supplier ID must be an integer'),
    body('OrderDate').isISO8601().withMessage('Order Date must be a valid date'),
    body('ExpectedDeliveryDate').isISO8601().withMessage('Expected Delivery Date must be a valid date'),
    body('ShippingAddress').optional().isObject().withMessage('Shipping Address must be an object'),
    body('ShippingAddress.AddressLine1').optional().notEmpty().withMessage('Shipping Address Line 1 is required'),
    body('ShippingAddress.AddressLine2').optional().isString().withMessage('Shipping Address Line 2 must be a string'),
    body('ShippingAddress.City').optional().notEmpty().withMessage('Shipping Address City is required'),
    body('ShippingAddress.StateProvince').optional().isString().withMessage('Shipping Address State/Province must be a string'),
    body('ShippingAddress.PostalCode').optional().notEmpty().withMessage('Shipping Address Postal Code is required'),
    body('ShippingAddress.Country').optional().notEmpty().withMessage('Shipping Address Country is required'),
    body('BillingAddress').optional().isObject().withMessage('Billing Address must be an object'),
    body('BillingAddress.AddressLine1').optional().notEmpty().withMessage('Billing Address Line 1 is required'),
    body('BillingAddress.AddressLine2').optional().isString().withMessage('Billing Address Line 2 must be a string'),
    body('BillingAddress.City').optional().notEmpty().withMessage('Billing Address City is required'),
    body('BillingAddress.StateProvince').optional().isString().withMessage('Billing Address State/Province must be a string'),
    body('BillingAddress.PostalCode').optional().notEmpty().withMessage('Billing Address Postal Code is required'),
    body('BillingAddress.Country').optional().notEmpty().withMessage('Billing Address Country is required'),
    body('OrderCreatedByUserID').isInt().withMessage('Order Created By User ID must be an integer'),
    body('lineItems').isArray().optional().withMessage('Line Items must be an array'),
    body('lineItems.*.ProductID').isInt().optional().withMessage('Product ID in line item must be an integer'),
    body('lineItems.*.QuantityOrdered').isInt({ min: 1 }).optional().withMessage('Quantity Ordered in line item must be a positive integer'),
    body('lineItems.*.UnitOfMeasure').notEmpty().optional().withMessage('Unit of Measure in line item is required'),
    body('lineItems.*.UnitPrice').isNumeric().optional().withMessage('Unit Price in line item must be a number'),
    body('lineItems.*.ExpectedDeliveryDate').isISO8601().optional().withMessage('Expected Delivery Date in line item must be a valid date'),
    body('Notes').optional().isString().withMessage('Notes must be a string'),
];

exports.updatePurchaseOrderValidationRules = [
    param('id').isInt().withMessage('ID must be an integer'),
    body('PONumber').optional().notEmpty().withMessage('PO Number is required'),
    body('SupplierID').optional().isInt().withMessage('Supplier ID must be an integer'),
    body('OrderDate').optional().isISO8601().withMessage('Order Date must be a valid date'),
    body('ExpectedDeliveryDate').optional().isISO8601().withMessage('Expected Delivery Date must be a valid date'),
    body('ShippingAddress').optional().isObject().withMessage('Shipping Address must be an object'),
    body('ShippingAddress.AddressLine1').optional().notEmpty().withMessage('Shipping Address Line 1 is required'),

    body('ShippingAddress.AddressLine2').optional().isString().withMessage('Shipping Address Line 2 must be a string'),

    body('ShippingAddress.City').optional().notEmpty().withMessage('Shipping Address City is required'),

    body('ShippingAddress.StateProvince').optional().isString().withMessage('Shipping Address State/Province must be a string'),


    body('ShippingAddress.PostalCode').optional().notEmpty().withMessage('Shipping Address Postal Code is required'),
    body('ShippingAddress.Country').optional().notEmpty().withMessage('Shipping Address Country is required'),
    body('BillingAddress').optional().isObject().withMessage('Billing Address must be an object'),
    body('BillingAddress.AddressLine1').optional().notEmpty().withMessage('Billing Address Line 1 is required'),
    body('BillingAddress.AddressLine2').optional().isString().withMessage('Billing Address Line 2 must be a string'),
    body('BillingAddress.City').optional().notEmpty().withMessage('Billing Address City is required'),
    body('BillingAddress.StateProvince').optional().isString().withMessage('Billing Address State/Province must be a string'),
    body('BillingAddress.PostalCode').optional().notEmpty().withMessage('Billing Address Postal Code is required'),
    body('BillingAddress.Country').optional().notEmpty().withMessage('Billing Address Country is required'),
    body('OrderStatus').optional().isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']).withMessage('Invalid Order Status'),
    body('Notes').optional().isString().withMessage('Notes must be a string'),
];

exports.addLineItemToPurchaseOrderValidationRules = [
    param('purchaseOrderId').isInt().withMessage('Purchase Order ID must be an integer'),
    body('ProductID').isInt().withMessage('Product ID is required'),
    body('QuantityOrdered').isInt({ min: 1 }).withMessage('Quantity Ordered must be a positive integer'),
    body('UnitOfMeasure').notEmpty().withMessage('Unit of Measure is required'),
    body('UnitPrice').isNumeric().withMessage('Unit Price must be a number'),
    body('ExpectedDeliveryDate').isISO8601().optional().withMessage('Expected Delivery Date must be a valid date'),
];

exports.updatePurchaseOrderLineItemValidationRules = [
    param('lineItemId').isInt().withMessage('Line Item ID must be an integer'),
    body('ProductID').optional().isInt().withMessage('Product ID must be an integer'),
    body('QuantityOrdered').optional().isInt({ min: 1 }).withMessage('Quantity Ordered must be a positive integer'),
    body('UnitOfMeasure').optional().notEmpty().withMessage('Unit of Measure is required'),
    body('UnitPrice').optional().isNumeric().withMessage('Unit Price must be a number'),
    body('ExpectedDeliveryDate').optional().isISO8601().withMessage('Expected Delivery Date must be a valid date'),
];

exports.getPurchaseOrderLineItemsValidationRules = [
    param('purchaseOrderId').isInt().withMessage('Purchase Order ID must be an integer'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('sortBy').optional().isString().withMessage('SortBy must be a string'),
    query('sortOrder').optional().isIn(['ASC', 'DESC']).withMessage('SortOrder must be ASC or DESC'),
    query('productId').optional().isInt().withMessage('Product ID must be an integer'),
];

exports.getPurchaseOrderLineItemByIdValidationRules = [
    param('lineItemId').isInt().withMessage('Line Item ID must be an integer'),
];

exports.deletePurchaseOrderLineItemValidationRules = [
    param('lineItemId').isInt().withMessage('Line Item ID must be an integer'),
];

exports.getPurchaseOrderByIdValidationRules = [
    param('id').isInt().withMessage('ID must be an integer'),
];

exports.deletePurchaseOrderValidationRules = [
    param('id').isInt().withMessage('ID must be an integer'),
];