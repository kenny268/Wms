const shipmentService = require('../services/shipmentService');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const createShipment = async (req, res) => {
    try {
        const shipment = await shipmentService.createShipment(req.body);
        return res.status(201).json(shipment);
    } catch (error) {
        logger.error(`Error creating shipment: ${error.message}`, { body: req.body });
        if (error.message.includes('not found') || error.message.includes('exceeds')) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getAllShipments = async (req, res) => {
    try {
        const filters = {
            outboundOrderId: req.query.outboundOrderId,
            shipmentStatus: req.query.shipmentStatus,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };
        const pagination = {
            page: req.query.page || 1,
            limit: req.query.limit || 20,
        };
        const { count, rows } = await shipmentService.getAllShipments(filters, pagination);
        return res.status(200).json({ count, rows });
    } catch (error) {
        logger.error(`Error retrieving shipments: ${error.message}`, { query: req.query });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getShipmentById = async (req, res) => {
    try {
        const shipment = await shipmentService.getShipmentById(req.params.id);
        if (!shipment) {
            return res.status(404).json({ message: `Shipment with ID ${req.params.id} not found.` });
        }
        return res.status(200).json(shipment);
    } catch (error) {
        logger.error(`Error retrieving shipment by ID: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const updateShipment = async (req, res) => {
    try {
        const updatedShipment = await shipmentService.updateShipment(req.params.id, req.body);
        if (!updatedShipment) {
            return res.status(404).json({ message: `Shipment with ID ${req.params.id} not found.` });
        }
        return res.status(200).json(updatedShipment);
    } catch (error) {
        logger.error(`Error updating shipment: ${error.message}`, { params: req.params, body: req.body });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const deleteShipment = async (req, res) => {
    try {
        const isDeleted = await shipmentService.deleteShipment(req.params.id);
        if (!isDeleted) {
            return res.status(404).json({ message: `Shipment with ID ${req.params.id} not found.` });
        }
        return res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting shipment: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const addLineItemToShipment = async (req, res) => {
    try {
        const newLineItem = await shipmentService.addLineItemToShipment(req.params.shipmentId, req.body);
        return res.status(201).json(newLineItem);
    } catch (error) {
        logger.error(`Error adding line item to shipment: ${error.message}`, { params: req.params, body: req.body });
        if (error.message.includes('not found') || error.message.includes('exceeds')) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getAllShipmentLineItems = async (req, res) => {
    try {
        const lineItems = await shipmentService.getAllShipmentLineItems(req.params.shipmentId);
        return res.status(200).json(lineItems);
    } catch (error) {
        logger.error(`Error retrieving shipment line items: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getShipmentLineItemById = async (req, res) => {
    try {
        const lineItem = await shipmentService.getShipmentLineItemById(req.params.lineItemId);
        if (!lineItem) {
            return res.status(404).json({ message: `Shipment line item with ID ${req.params.lineItemId} not found.` });
        }
        return res.status(200).json(lineItem);
    } catch (error) {
        logger.error(`Error retrieving shipment line item by ID: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const updateShipmentLineItem = async (req, res) => {
    try {
        const updatedLineItem = await shipmentService.updateShipmentLineItem(req.params.lineItemId, req.body);
        if (!updatedLineItem) {
            return res.status(404).json({ message: `Shipment line item with ID ${req.params.lineItemId} not found.` });
        }
        return res.status(200).json(updatedLineItem);
    } catch (error) {
        logger.error(`Error updating shipment line item: ${error.message}`, { params: req.params, body: req.body });
        if (error.message.includes('exceeds')) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const deleteShipmentLineItem = async (req, res) => {
    try {
        const isDeleted = await shipmentService.deleteShipmentLineItem(req.params.lineItemId);
        if (!isDeleted) {
            return res.status(404).json({ message: `Shipment line item with ID ${req.params.lineItemId} not found.` });
        }
        return res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting shipment line item: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

module.exports = {
    handleValidationErrors,
    createShipment,
    getAllShipments,
    getShipmentById,
    updateShipment,
    deleteShipment,
    addLineItemToShipment,
    getAllShipmentLineItems,
    getShipmentLineItemById,
    updateShipmentLineItem,
    deleteShipmentLineItem,
};