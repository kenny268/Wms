const { body, param, query } = require('express-validator');

const validateCreateReturnAuthorization = [
    body('OutboundOrderID').isInt().withMessage('Outbound Order ID is required'),
    body('ReturnAuthorizationNumber').notEmpty().withMessage('Return Authorization Number is required'),
    body('ReturnDate').isISO8601().withMessage('Return Date must be a valid date'),
    body('RequestedByUserID').isInt().withMessage('Requested By User ID is required'),
    body('ReturnReason').notEmpty().withMessage('Return Reason is required'),
    body('ReturnAuthorizationStatus').optional().isIn(['Pending', 'Approved', 'Rejected', 'Received', 'Closed']).withMessage('Invalid Return Authorization Status'),
    body('returnAuthorizationLineItems').isArray().optional().withMessage('Return Authorization Line Items must be an array'),
    body('returnAuthorizationLineItems.*.OutboundOrderLineItemID').isInt().withMessage('Outbound Order Line Item ID in return must be an integer'),
    body('returnAuthorizationLineItems.*.QuantityReturned').isInt({ min: 1 }).withMessage('Quantity Returned in return must be a positive integer'),
    body('returnAuthorizationLineItems.*.ReasonForReturn').notEmpty().withMessage('Reason For Return in return item is required'),
];

const validateGetAllReturnAuthorizations = [
    query('outboundOrderId').optional().isInt().withMessage('Outbound Order ID must be an integer'),
    query('returnAuthorizationStatus').optional().isIn(['Pending', 'Approved', 'Rejected', 'Received', 'Closed']).withMessage('Invalid Return Authorization Status'),
    query('startDate').optional().isISO8601().withMessage('Start Date must be a valid date'),
    query('endDate').optional().isISO8601().withMessage('End Date must be a valid date'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

const validateGetReturnAuthorizationById = [
    param('id').isInt().withMessage('ID must be an integer'),
];

const validateUpdateReturnAuthorization = [
    param('id').isInt().withMessage('ID must be an integer'),
    body('ReturnAuthorizationStatus').optional().isIn(['Pending', 'Approved', 'Rejected', 'Received', 'Closed']).withMessage('Invalid Return Authorization Status'),
    body('ApprovedByUserID').optional().isInt().withMessage('Approved By User ID must be an integer'),
    body('Notes').optional().isString().withMessage('Notes must be a string'),
    // Add other fields that can be updated
];

const validateDeleteReturnAuthorization = [
    param('id').isInt().withMessage('ID must be an integer'),
];

const validateAddLineItemToReturnAuthorization = [
    param('returnAuthorizationId').isInt().withMessage('Return Authorization ID must be an integer'),
    body('OutboundOrderLineItemID').isInt().withMessage('Outbound Order Line Item ID is required'),
    body('QuantityReturned').isInt({ min: 1 }).withMessage('Quantity Returned must be a positive integer'),
    body('ReasonForReturn').notEmpty().withMessage('Reason For Return is required'),
];

const validateGetAllReturnAuthorizationLineItems = [
    param('returnAuthorizationId').isInt().withMessage('Return Authorization ID must be an integer'),
];

const validateGetReturnAuthorizationLineItemById = [
    param('lineItemId').isInt().withMessage('Line Item ID must be an integer'),
];

const validateUpdateReturnAuthorizationLineItem = [
    param('lineItemId').isInt().withMessage('Line Item ID must be an integer'),
    body('QuantityReturned').optional().isInt({ min: 1 }).withMessage('Quantity Returned must be a positive integer'),
    body('ReasonForReturn').optional().notEmpty().withMessage('Reason For Return is required'),
    body('ConditionOnReturn').optional().isString().withMessage('Condition On Return must be a string'),
    body('Notes').optional().isString().withMessage('Notes must be a string'),
];

const validateDeleteReturnAuthorizationLineItem = [
    param('lineItemId').isInt().withMessage('Line Item ID must be an integer'),
];

const validateReceiveReturnedItems = [
    param('returnAuthorizationId').isInt().withMessage('Return Authorization ID must be an integer'),
    body('ReceivedByUserID').isInt().withMessage('Received By User ID is required'),
    body('receiptLineItems').isArray().withMessage('Receipt Line Items must be an array'),
    body('receiptLineItems.*.ReturnAuthorizationLineItemID').isInt().withMessage('Return Authorization Line Item ID in receipt must be an integer'),
    body('receiptLineItems.*.QuantityReceived').isInt({ min: 1 }).withMessage('Quantity Received in receipt must be a positive integer'),
    body('receiptLineItems.*.ReceivingLocationID').isInt().withMessage('Receiving Location ID in receipt must be an integer'),
    body('receiptLineItems.*.ConditionOnReturn').optional().isString().withMessage('Condition On Return can be a string'),
];

module.exports = {
    validateCreateReturnAuthorization,
    validateGetAllReturnAuthorizations,
    validateGetReturnAuthorizationById,
    validateUpdateReturnAuthorization,
    validateDeleteReturnAuthorization,
    validateAddLineItemToReturnAuthorization,
    validateGetAllReturnAuthorizationLineItems,
    validateGetReturnAuthorizationLineItemById,
    validateUpdateReturnAuthorizationLineItem,
    validateDeleteReturnAuthorizationLineItem,
    validateReceiveReturnedItems,
};