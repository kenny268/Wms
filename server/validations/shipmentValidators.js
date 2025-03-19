const { body, param, query } = require('express-validator');

const validateCreateShipment = [
    body('OutboundOrderID').isInt().withMessage('Outbound Order ID is required'),
    body('ShipmentDate').isISO8601().withMessage('Shipment Date must be a valid date'),
    body('ShippingCarrier').notEmpty().withMessage('Shipping Carrier is required'),
    body('TrackingNumber').notEmpty().withMessage('Tracking Number is required'),
    body('ShippedByUserID').isInt().withMessage('Shipped By User ID is required'),
    body('ShipmentStatus').optional().isIn(['Pending', 'InTransit', 'Delivered', 'Cancelled']).withMessage('Invalid Shipment Status'),
    body('shipmentLineItems').isArray().optional().withMessage('Shipment Line Items must be an array'),
    body('shipmentLineItems.*.OutboundOrderLineItemID').isInt().withMessage('Outbound Order Line Item ID in shipment must be an integer'),
    body('shipmentLineItems.*.QuantityShipped').isInt({ min: 1 }).withMessage('Quantity Shipped in shipment must be a positive integer'),
];

const validateGetAllShipments = [
    query('outboundOrderId').optional().isInt().withMessage('Outbound Order ID must be an integer'),
    query('shipmentStatus').optional().isIn(['Pending', 'InTransit', 'Delivered', 'Cancelled']).withMessage('Invalid Shipment Status'),
    query('startDate').optional().isISO8601().withMessage('Start Date must be a valid date'),
    query('endDate').optional().isISO8601().withMessage('End Date must be a valid date'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

const validateGetShipmentById = [
    param('id').isInt().withMessage('ID must be an integer'),
];

const validateUpdateShipment = [
    param('id').isInt().withMessage('ID must be an integer'),
    body('ShipmentStatus').optional().isIn(['Pending', 'InTransit', 'Delivered', 'Cancelled']).withMessage('Invalid Shipment Status'),
    body('TrackingNumber').optional().notEmpty().withMessage('Tracking Number cannot be empty'),
    body('ShippingCarrier').optional().notEmpty().withMessage('Shipping Carrier cannot be empty'),
    body('ShippingCost').optional().isNumeric().withMessage('Shipping Cost must be a number'),
    body('ShippedByUserID').optional().isInt().withMessage('Shipped By User ID must be an integer'),
    body('DepartureTime').optional().isISO8601().withMessage('Departure Time must be a valid date'),
    body('EstimatedArrivalTime').optional().isISO8601().withMessage('Estimated Arrival Time must be a valid date'),
    body('DeliveryConfirmationNumber').optional().isString().withMessage('Delivery Confirmation Number must be a string'),
    body('DeliveryDateTime').optional().isISO8601().withMessage('Delivery Date Time must be a valid date'),
    body('Notes').optional().isString().withMessage('Notes must be a string'),
];

const validateDeleteShipment = [
    param('id').isInt().withMessage('ID must be an integer'),
];

const validateAddLineItemToShipment = [
    param('shipmentId').isInt().withMessage('Shipment ID must be an integer'),
    body('OutboundOrderLineItemID').isInt().withMessage('Outbound Order Line Item ID is required'),
    body('QuantityShipped').isInt({ min: 1 }).withMessage('Quantity Shipped must be a positive integer'),
];

const validateGetAllShipmentLineItems = [
    param('shipmentId').isInt().withMessage('Shipment ID must be an integer'),
];

const validateGetShipmentLineItemById = [
    param('lineItemId').isInt().withMessage('Line Item ID must be an integer'),
];

const validateUpdateShipmentLineItem = [
    param('lineItemId').isInt().withMessage('Line Item ID must be an integer'),
    body('QuantityShipped').optional().isInt({ min: 1 }).withMessage('Quantity Shipped must be a positive integer'),
];

const validateDeleteShipmentLineItem = [
    param('lineItemId').isInt().withMessage('Line Item ID must be an integer'),
];

module.exports = {
    validateCreateShipment,
    validateGetAllShipments,
    validateGetShipmentById,
    validateUpdateShipment,
    validateDeleteShipment,
    validateAddLineItemToShipment,
    validateGetAllShipmentLineItems,
    validateGetShipmentLineItemById,
    validateUpdateShipmentLineItem,
    validateDeleteShipmentLineItem,
};