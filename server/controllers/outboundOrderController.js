const outboundOrderService = require('../services/outboundOrderService');
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

const createOutboundOrder = async (req, res) => {
    try {
        const outboundOrder = await outboundOrderService.createOutboundOrder(req.body);
        return res.status(201).json(outboundOrder);
    } catch (error) {
        logger.error(`Error creating outbound order: ${error.message}`, { body: req.body });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getAllOutboundOrders = async (req, res) => {
    try {
        const filters = {
            customerId: req.query.customerId,
            orderStatus: req.query.orderStatus,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };
        const pagination = {
            page: req.query.page || 1,
            limit: req.query.limit || 20,
        };
        const { count, rows } = await outboundOrderService.getAllOutboundOrders(filters, pagination);
        return res.status(200).json({ count, rows });
    } catch (error) {
        logger.error(`Error retrieving outbound orders: ${error.message}`, { query: req.query });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getOutboundOrderById = async (req, res) => {
    try {
        const outboundOrder = await outboundOrderService.getOutboundOrderById(req.params.id);
        if (!outboundOrder) {
            return res.status(404).json({ message: `Outbound order with ID ${req.params.id} not found.` });
        }
        return res.status(200).json(outboundOrder);
    } catch (error) {
        logger.error(`Error retrieving outbound order by ID: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const updateOutboundOrder = async (req, res) => {
    try {
        const updatedOrder = await outboundOrderService.updateOutboundOrder(req.params.id, req.body);
        if (!updatedOrder) {
            return res.status(404).json({ message: `Outbound order with ID ${req.params.id} not found.` });
        }
        return res.status(200).json(updatedOrder);
    } catch (error) {
        logger.error(`Error updating outbound order: ${error.message}`, { params: req.params, body: req.body });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const deleteOutboundOrder = async (req, res) => {
    try {
        const isDeleted = await outboundOrderService.deleteOutboundOrder(req.params.id);
        if (!isDeleted) {
            return res.status(404).json({ message: `Outbound order with ID ${req.params.id} not found.` });
        }
        return res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting outbound order: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const addLineItemToOutboundOrder = async (req, res) => {
    try {
        const newLineItem = await outboundOrderService.addLineItemToOutboundOrder(req.params.orderId, req.body);
        return res.status(201).json(newLineItem);
    } catch (error) {
        logger.error(`Error adding line item to order: ${error.message}`, { params: req.params, body: req.body });
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getAllOutboundOrderLineItems = async (req, res) => {
    try {
        const lineItems = await outboundOrderService.getAllOutboundOrderLineItems(req.params.orderId);
        return res.status(200).json(lineItems);
    } catch (error) {
        logger.error(`Error retrieving line items for order: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getOutboundOrderLineItemById = async (req, res) => {
    try {
        const lineItem = await outboundOrderService.getOutboundOrderLineItemById(req.params.lineItemId);
        if (!lineItem) {
            return res.status(404).json({ message: `Outbound order line item with ID ${req.params.lineItemId} not found.` });
        }
        return res.status(200).json(lineItem);
    } catch (error) {
        logger.error(`Error retrieving line item by ID: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const updateOutboundOrderLineItem = async (req, res) => {
    try {
        const updatedLineItem = await outboundOrderService.updateOutboundOrderLineItem(req.params.lineItemId, req.body);
        if (!updatedLineItem) {
            return res.status(404).json({ message: `Outbound order line item with ID ${req.params.lineItemId} not found.` });
        }
        return res.status(200).json(updatedLineItem);
    } catch (error) {
        logger.error(`Error updating line item: ${error.message}`, { params: req.params, body: req.body });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const deleteOutboundOrderLineItem = async (req, res) => {
    try {
        const isDeleted = await outboundOrderService.deleteOutboundOrderLineItem(req.params.lineItemId);
        if (!isDeleted) {
            return res.status(404).json({ message: `Outbound order line item with ID ${req.params.lineItemId} not found.` });
        }
        return res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting line item: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const allocateInventoryToOrder = async (req, res) => {
    try {
        const allocationResult = await outboundOrderService.allocateInventoryToOrder(req.params.orderId);
        return res.status(200).json(allocationResult);
    } catch (error) {
        logger.error(`Error allocating inventory to order: ${error.message}`, { params: req.params });
        if (error.message.includes('not found') || error.message.includes('no line items')) {
            return res.status(404).json({ message: error.message });
        } else if (error.message.includes('Insufficient inventory')) {
            return res.status(409).json({ message: error.message });
        }
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

module.exports = {
    handleValidationErrors,
    createOutboundOrder,
    getAllOutboundOrders,
    getOutboundOrderById,
    updateOutboundOrder,
    deleteOutboundOrder,
    addLineItemToOutboundOrder,
    getAllOutboundOrderLineItems,
    getOutboundOrderLineItemById,
    updateOutboundOrderLineItem,
    deleteOutboundOrderLineItem,
    allocateInventoryToOrder,
};