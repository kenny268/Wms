const { body, param, query } = require('express-validator');

const validateCreateReceipt = [
    body('SupplierID').isInt().withMessage('Supplier ID must be an integer'),
    body('ReceiptDate').isISO8601().withMessage('Receipt Date must be a valid ISO 8601 date'),
    body('ReferenceNumber').optional().isString().withMessage('Reference Number must be a string'),
    body('Notes').optional().isString().withMessage('Notes must be a string'),
    body('ExpectedDeliveryDate').optional().isISO8601().withMessage('Expected Delivery Date must be a valid ISO 8601 date'),
    body('CarrierName').optional().isString().withMessage('Carrier Name must be a string'),
    body('TrackingNumber').optional().isString().withMessage('Tracking Number must be a string'),
    body('PONumber').optional().isString().withMessage('PO Number must be a string'),
    body('NumberOfPallets').optional().isInt({ min: 0 }).withMessage('Number of Pallets must be a non-negative integer'),
    body('SealNumbers').optional().isString().withMessage('Seal Numbers must be a string'),
    body('TemperatureOnArrival').optional().isNumeric().withMessage('Temperature on Arrival must be numeric'),
    body('ConditionOnArrival').optional().isString().withMessage('Condition on Arrival must be a string'),
    body('DriverName').optional().isString().withMessage('Driver Name must be a string'),
    body('UnloadingStartTime').optional().isISO8601().withMessage('Unloading Start Time must be a valid ISO 8601 date'),
    body('UnloadingEndTime').optional().isISO8601().withMessage('Unloading End Time must be a valid ISO 8601 date'),
    body('ReceivingBayLocation').optional().isString().withMessage('Receiving Bay Location must be a string'),
    body('InspectionStatus').optional().isString().withMessage('Inspection Status must be a string'),
    body('InspectionDateTime').optional().isISO8601().withMessage('Inspection Date Time must be a valid ISO 8601 date'),
    body('SampleSizeInspected').optional().isInt({ min: 0 }).withMessage('Sample Size Inspected must be a non-negative integer'),
    body('PurchaseOrderID').optional().isInt().withMessage('Purchase Order ID must be an integer'),
];

const validateAddLineItemToReceipt = [
    param('receiptId').isInt().withMessage('Receipt ID must be an integer'),
    body('ProductID').isInt().withMessage('Product ID is required'),
    body('ExpectedQuantity').isInt({ min: 1 }).withMessage('Expected Quantity must be a positive integer'),
    body('ReceivedQuantity').isInt({ min: 0 }).withMessage('Received Quantity must be a non-negative integer'),
    body('UOMID').isInt().withMessage('Unit of Measure ID is required'),
    body('LotNumber').optional().isString().withMessage('Lot Number must be a string'),
    body('ExpirationDate').optional().isISO8601().withMessage('Expiration Date must be a valid ISO 8601 date'),
    body('SerialNumber').optional().isString().withMessage('Serial Number must be a string'),
    body('ConditionOnReceipt').optional().isString().withMessage('Condition on Receipt must be a string'),
    body('CountryOfOrigin').optional().isString().withMessage('Country of Origin must be a string'),
    body('PurchaseOrderLineItemID').optional().isInt().withMessage('Purchase Order Line Item ID must be an integer'),
];

const validateReceiveReceipt = [
    param('receiptId').isInt().withMessage('Receipt ID must be an integer'),
];

const validateGetAllReceipts = [
    query('supplierId').optional().isInt().withMessage('Supplier ID must be an integer'),
    query('receiptDate').optional().isISO8601().withMessage('Receipt Date must be a valid ISO 8601 date'),
    query('referenceNumber').optional().isString().withMessage('Reference Number must be a string'),
    query('status').optional().isIn(['Draft', 'Received', 'Cancelled']).withMessage('Status must be one of: Draft, Received, Cancelled'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

const validateGetReceiptById = [
    param('id').isInt().withMessage('ID must be an integer'),
];

const validateUpdateReceipt = [
    param('id').isInt().withMessage('ID must be an integer'),
    body('SupplierID').optional().isInt().withMessage('Supplier ID must be an integer'),
    body('ReceiptDate').optional().isISO8601().withMessage('Receipt Date must be a valid ISO 8601 date'),
    body('ReferenceNumber').optional().isString().withMessage('Reference Number must be a string'),
    body('Notes').optional().isString().withMessage('Notes must be a string'),
    body('ExpectedDeliveryDate').optional().isISO8601().withMessage('Expected Delivery Date must be a valid ISO 8601 date'),
    body('CarrierName').optional().isString().withMessage('Carrier Name must be a string'),
    body('TrackingNumber').optional().isString().withMessage('Tracking Number must be a string'),
    body('PONumber').optional().isString().withMessage('PO Number must be a string'),
    body('NumberOfPallets').optional().isInt({ min: 0 }).withMessage('Number of Pallets must be a non-negative integer'),
    body('SealNumbers').optional().isString().withMessage('Seal Numbers must be a string'),
    body('TemperatureOnArrival').optional().isNumeric().withMessage('Temperature on Arrival must be numeric'),
    body('ConditionOnArrival').optional().isString().withMessage('Condition on Arrival must be a string'),
    body('DriverName').optional().isString().withMessage('Driver Name must be a string'),
    body('UnloadingStartTime').optional().isISO8601().withMessage('Unloading Start Time must be a valid ISO 8601 date'),
    body('UnloadingEndTime').optional().isISO8601().withMessage('Unloading End Time must be a valid ISO 8601 date'),
    body('ReceivingBayLocation').optional().isString().withMessage('Receiving Bay Location must be a string'),
    body('InspectionStatus').optional().isString().withMessage('Inspection Status must be a string'),
    body('InspectionDateTime').optional().isISO8601().withMessage('Inspection Date Time must be a valid ISO 8601 date'),
    body('SampleSizeInspected').optional().isInt({ min: 0 }).withMessage('Sample Size Inspected must be a non-negative integer'),
    body('PurchaseOrderID').optional().isInt().withMessage('Purchase Order ID must be an integer'),
];

const validateCancelReceipt = [
    param('id').isInt().withMessage('ID must be an integer'),
];

const validateDeleteReceipt = [
    param('id').isInt().withMessage('ID must be an integer'),
];

module.exports = {
    validateCreateReceipt,
    validateAddLineItemToReceipt,
    validateReceiveReceipt,
    validateGetAllReceipts,
    validateGetReceiptById,
    validateUpdateReceipt,
    validateCancelReceipt,
    validateDeleteReceipt,
};