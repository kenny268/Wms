const returnAuthorizationService = require('../services/returnAuthorizationService');
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

const createReturnAuthorization = async (req, res) => {
    try {
        const returnAuthorization = await returnAuthorizationService.createReturnAuthorization(req.body);
        return res.status(201).json(returnAuthorization);
    } catch (error) {
        logger.error(`Error creating return authorization: ${error.message}`, { body: req.body });
        if (error.message.includes('not found') || error.message.includes('exceeds')) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getAllReturnAuthorizations = async (req, res) => {
    try {
        const filters = {
            outboundOrderId: req.query.outboundOrderId,
            returnAuthorizationStatus: req.query.returnAuthorizationStatus,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };
        const pagination = {
            page: req.query.page || 1,
            limit: req.query.limit || 20,
        };
        const { count, rows } = await returnAuthorizationService.getAllReturnAuthorizations(filters, pagination);
        return res.status(200).json({ count, rows });
    } catch (error) {
        logger.error(`Error retrieving return authorizations: ${error.message}`, { query: req.query });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getReturnAuthorizationById = async (req, res) => {
    try {
        const returnAuthorization = await returnAuthorizationService.getReturnAuthorizationById(req.params.id);
        if (!returnAuthorization) {
            return res.status(404).json({ message: `Return authorization with ID ${req.params.id} not found.` });
        }
        return res.status(200).json(returnAuthorization);
    } catch (error) {
        logger.error(`Error retrieving return authorization by ID: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const updateReturnAuthorization = async (req, res) => {
    try {
        const updatedReturnAuthorization = await returnAuthorizationService.updateReturnAuthorization(req.params.id, req.body);
        if (!updatedReturnAuthorization) {
            return res.status(404).json({ message: `Return authorization with ID ${req.params.id} not found.` });
        }
        return res.status(200).json(updatedReturnAuthorization);
    } catch (error) {
        logger.error(`Error updating return authorization: ${error.message}`, { params: req.params, body: req.body });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const deleteReturnAuthorization = async (req, res) => {
    try {
        const isDeleted = await returnAuthorizationService.deleteReturnAuthorization(req.params.id);
        if (!isDeleted) {
            return res.status(404).json({ message: `Return authorization with ID ${req.params.id} not found.` });
        }
        return res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting return authorization: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const addLineItemToReturnAuthorization = async (req, res) => {
    try {
        const newLineItem = await returnAuthorizationService.addLineItemToReturnAuthorization(req.params.returnAuthorizationId, req.body);
        return res.status(201).json(newLineItem);
    } catch (error) {
        logger.error(`Error adding line item to return authorization: ${error.message}`, { params: req.params, body: req.body });
        if (error.message.includes('not found') || error.message.includes('exceeds')) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getAllReturnAuthorizationLineItems = async (req, res) => {
    try {
        const lineItems = await returnAuthorizationService.getAllReturnAuthorizationLineItems(req.params.returnAuthorizationId);
        return res.status(200).json(lineItems);
    } catch (error) {
        logger.error(`Error retrieving return authorization line items: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getReturnAuthorizationLineItemById = async (req, res) => {
    try {
        const lineItem = await returnAuthorizationService.getReturnAuthorizationLineItemById(req.params.lineItemId);
        if (!lineItem) {
            return res.status(404).json({ message: `Return authorization line item with ID ${req.params.lineItemId} not found.` });
        }
        return res.status(200).json(lineItem);
    } catch (error) {
        logger.error(`Error retrieving return authorization line item by ID: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const updateReturnAuthorizationLineItem = async (req, res) => {
    try {
        const updatedLineItem = await returnAuthorizationService.updateReturnAuthorizationLineItem(req.params.lineItemId, req.body);
        if (!updatedLineItem) {
            return res.status(404).json({ message: `Return authorization line item with ID ${req.params.lineItemId} not found.` });
        }
        return res.status(200).json(updatedLineItem);
    } catch (error) {
        logger.error(`Error updating return authorization line item: ${error.message}`, { params: req.params, body: req.body });
        if (error.message.includes('exceeds')) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const deleteReturnAuthorizationLineItem = async (req, res) => {
    try {
        const isDeleted = await returnAuthorizationService.deleteReturnAuthorizationLineItem(req.params.lineItemId);
        if (!isDeleted) {
            return res.status(404).json({ message: `Return authorization line item with ID ${req.params.lineItemId} not found.` });
        }
        return res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting return authorization line item: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const receiveReturnedItems = async (req, res) => {
    try {
        const result = await returnAuthorizationService.receiveReturnedItems(req.params.returnAuthorizationId, req.body);
        if (result.status === 400 || result.status === 404 || result.status === 409) {
            return res.status(result.status).json({ message: result.message });
        }
        return res.status(201).json(result);
    } catch (error) {
        logger.error(`Error receiving returned items: ${error.message}`, { params: req.params, body: req.body });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

module.exports = {
    handleValidationErrors,
    createReturnAuthorization,
    getAllReturnAuthorizations,
    getReturnAuthorizationById,
    updateReturnAuthorization,
    deleteReturnAuthorization,
    addLineItemToReturnAuthorization,
    getAllReturnAuthorizationLineItems,
    getReturnAuthorizationLineItemById,
    updateReturnAuthorizationLineItem,
    deleteReturnAuthorizationLineItem,
    receiveReturnedItems,
};