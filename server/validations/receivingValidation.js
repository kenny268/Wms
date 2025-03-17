const { body, param, query } = require('express-validator'); 
const { handleValidationErrors } = require('../validations/receivingValidation');

// Create a new receipt, handling both lot-tracked and break bulk items
exports.createReceiptValidation = [
    body('ReceiptDate').notEmpty().isISO8601(),
    body('ReceiverUserID').notEmpty().isInt({ min: 1 }),
    body('PONumber').optional().isString(),
    body('CarrierName').optional().isString(),
    body('TrackingNumber').optional().isString(),
    body('ConditionOnArrival').optional().isString(),
    body('ExpectedDeliveryDate').optional().isISO8601(),
    body('NumberOfPallets').optional().isInt({ min: 0 }),
    body('SealNumbers').optional().isString(),
    body('TemperatureOnArrival').optional().isNumeric(),
    body('DriverName').optional().isString(),
    body('UnloadingStartTime').optional().isISO8601(),
    body('UnloadingEndTime').optional().isISO8601(),
    body('ReceivingBayLocation').optional().isString(),
    body('Notes').optional().isString(),
    body('InspectionStatus').optional().isString(),
    body('InspectionDateTime').optional().isISO8601(),
    body('SampleSizeInspected').optional().isInt({ min: 0 }),
    body('SupplierID').optional().isInt({ min: 1 }),
    body('InspectorUserID').optional().isInt({ min: 1 }),
    body('PurchaseOrderID').optional().isInt({ min: 1 }),
    body('receivedItems').isArray().notEmpty(),
    body('receivedItems.*.ProductID').notEmpty().isInt({ min: 1 }),
    body('receivedItems.*.ReceivedQuantity').notEmpty().isInt({ min: 0 }),
    body('receivedItems.*.UnitOfMeasure').notEmpty().isString(),
    body('receivedItems.*.LotNumber').optional().isString(),
    body('receivedItems.*.ExpirationDate').optional().isISO8601(),
    body('receivedItems.*.LocationID').notEmpty().isInt({ min: 1 }),
    body('receivedItems.*.IsBreakBulk').optional().isBoolean(),
    body('receivedItems.*.ExpectedQuantity').optional().isInt({ min: 0 }),
    body('receivedItems.*.PurchaseOrderLineItemID').optional().isInt({ min: 1 }),
    handleValidationErrors,
];

// Get a list of all receipts with enhanced filtering and pagination
exports.getAllReceiptsValidation = [
    query('poNumber').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    // Add validations for other potential query parameters
    handleValidationErrors,
];

// Get details of a specific receipt with all associated data
exports.getReceiptByIdValidation = [
    param('id').isInt({ min: 1 }).toInt(),
    handleValidationErrors,
];

// Update an existing receipt (more comprehensive checks and logic)
exports.updateReceiptValidation = [
    param('id').isInt({ min: 1 }).toInt(),
    // Add validations for the request body based on the fields you expect to update
    body('ReceiptDate').optional().isISO8601(),
    body('CarrierName').optional().isString(),
    body('TrackingNumber').optional().isString(),
    body('ConditionOnArrival').optional().isString(),
    body('ExpectedDeliveryDate').optional().isISO8601(),
    body('NumberOfPallets').optional().isInt({ min: 0 }),
    body('SealNumbers').optional().isString(),
    body('TemperatureOnArrival').optional().isNumeric(),
    body('DriverName').optional().isString(),
    body('UnloadingStartTime').optional().isISO8601(),
    body('UnloadingEndTime').optional().isISO8601(),
    body('ReceivingBayLocation').optional().isString(),
    body('Notes').optional().isString(),
    body('InspectionStatus').optional().isString(),
    body('InspectionDateTime').optional().isISO8601(),
    body('SampleSizeInspected').optional().isInt({ min: 0 }),
    body('SupplierID').optional().isInt({ min: 1 }),
    body('InspectorUserID').optional().isInt({ min: 1 }),
    body('PurchaseOrderID').optional().isInt({ min: 1 }),
    handleValidationErrors,
];

// Delete a specific receipt (consider implications on line items and inventory)
exports.deleteReceiptValidation = [
    param('id').isInt({ min: 1 }).toInt(),
    handleValidationErrors,
];

// Add a new line item to a receipt (with more validation and inventory update)
exports.addReceiptLineItemValidation = [
    param('receiptId').isInt({ min: 1 }).toInt(),
    body('ProductID').notEmpty().isInt({ min: 1 }),
    body('ReceivedQuantity').notEmpty().isInt({ min: 0 }),
    body('UnitOfMeasure').notEmpty().isString(),
    body('LotNumber').optional().isString(),
    body('ExpirationDate').optional().isISO8601(),
    body('LocationID').notEmpty().isInt({ min: 1 }),
    body('IsBreakBulk').optional().isBoolean(),
    body('ExpectedQuantity').optional().isInt({ min: 0 }),
    body('PurchaseOrderLineItemID').optional().isInt({ min: 1 }),
    handleValidationErrors,
];

// Get all line items for a specific receipt
exports.getAllReceiptLineItemsValidation = [
    param('receiptId').isInt({ min: 1 }).toInt(),
    handleValidationErrors,
];

// Update a specific receipt line item (with inventory adjustments and more checks)
exports.updateReceiptLineItemValidation = [
    param('lineItemId').isInt({ min: 1 }).toInt(),
    body('ReceivedQuantity').optional().isInt({ min: 0 }),
    body('LocationID').optional().isInt({ min: 1 }),
    body('ProductID').optional().isInt({ min: 1 }),
    body('LotNumber').optional().isString(),
    body('ExpirationDate').optional().isISO8601(),
    body('IsBreakBulk').optional().isBoolean(),
    // Add validations for other updatable fields as needed
    handleValidationErrors,
];

// Delete a specific receipt line item (with inventory adjustment)
exports.deleteReceiptLineItemValidation = [
    param('lineItemId').isInt({ min: 1 }).toInt(),
    handleValidationErrors,
];


