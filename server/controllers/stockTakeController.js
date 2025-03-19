const stockTakeService = require('../services/stockTakeService');
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

const createStockTake = async (req, res) => {
    try {
        const stockTake = await stockTakeService.createStockTake(req.body);
        return res.status(201).json(stockTake);
    } catch (error) {
        logger.error(`Error creating stock take: ${error.message}`, { body: req.body });
        if (error.message.includes('not found')) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const initiateStockTakeFromInventory = async (req, res) => {
    try {
        const stockTake = await stockTakeService.initiateStockTakeFromInventory(req.body);
        return res.status(201).json(stockTake);
    } catch (error) {
        logger.error(`Error initiating stock take from inventory: ${error.message}`, { body: req.body });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getAllStockTakes = async (req, res) => {
    try {
        const filters = {
            stockTakeStatus: req.query.stockTakeStatus,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
        };
        const pagination = {
            page: req.query.page || 1,
            limit: req.query.limit || 20,
        };
        const { count, rows } = await stockTakeService.getAllStockTakes(filters, pagination);
        return res.status(200).json({ count, rows });
    } catch (error) {
        logger.error(`Error retrieving stock takes: ${error.message}`, { query: req.query });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getStockTakeById = async (req, res) => {
    try {
        const stockTake = await stockTakeService.getStockTakeById(req.params.id);
        if (!stockTake) {
            return res.status(404).json({ message: `Stock take with ID ${req.params.id} not found.` });
        }
        return res.status(200).json(stockTake);
    } catch (error) {
        logger.error(`Error retrieving stock take by ID: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const updateStockTake = async (req, res) => {
    try {
        const updatedStockTake = await stockTakeService.updateStockTake(req.params.id, req.body);
        if (!updatedStockTake) {
            return res.status(404).json({ message: `Stock take with ID ${req.params.id} not found.` });
        }
        return res.status(200).json(updatedStockTake);
    } catch (error) {
        logger.error(`Error updating stock take: ${error.message}`, { params: req.params, body: req.body });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const deleteStockTake = async (req, res) => {
    try {
        const isDeleted = await stockTakeService.deleteStockTake(req.params.id);
        if (!isDeleted) {
            return res.status(404).json({ message: `Stock take with ID ${req.params.id} not found.` });
        }
        return res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting stock take: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const addStockTakeItem = async (req, res) => {
    try {
        const newItem = await stockTakeService.addStockTakeItem(req.params.stockTakeId, req.body);
        return res.status(201).json(newItem);
    } catch (error) {
        logger.error(`Error adding item to stock take: ${error.message}`, { params: req.params, body: req.body });
        if (error.message.includes('not found')) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getAllStockTakeItems = async (req, res) => {
    try {
        const items = await stockTakeService.getAllStockTakeItems(req.params.stockTakeId);
        return res.status(200).json(items);
    } catch (error) {
        logger.error(`Error retrieving stock take items: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getStockTakeItemById = async (req, res) => {
    try {
        const item = await stockTakeService.getStockTakeItemById(req.params.itemId);
        if (!item) {
            return res.status(404).json({ message: `Stock take item with ID ${req.params.itemId} not found.` });
        }
        return res.status(200).json(item);
    } catch (error) {
        logger.error(`Error retrieving stock take item by ID: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const updateStockTakeItem = async (req, res) => {
    try {
        const updatedItem = await stockTakeService.updateStockTakeItem(req.params.itemId, req.body);
        if (!updatedItem) {
            return res.status(404).json({ message: `Stock take item with ID ${req.params.itemId} not found.` });
        }
        return res.status(200).json(updatedItem);
    } catch (error) {
        logger.error(`Error updating stock take item: ${error.message}`, { params: req.params, body: req.body });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const deleteStockTakeItem = async (req, res) => {
    try {
        const isDeleted = await stockTakeService.deleteStockTakeItem(req.params.itemId);
        if (!isDeleted) {
            return res.status(404).json({ message: `Stock take item with ID ${req.params.itemId} not found.` });
        }
        return res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting stock take item: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const processStockTake = async (req, res) => {
    try {
        const result = await stockTakeService.processStockTake(req.params.stockTakeId);
        if (result.status === 400) {
            return res.status(result.status).json({ message: result.message });
        }
        return res.status(200).json(result);
    } catch (error) {
        logger.error(`Error processing stock take: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

module.exports = {
    handleValidationErrors,
    createStockTake,
    initiateStockTakeFromInventory,
    getAllStockTakes,
    getStockTakeById,
    updateStockTake,
    deleteStockTake,
    addStockTakeItem,
    getAllStockTakeItems,
    getStockTakeItemById,
    updateStockTakeItem,
    deleteStockTakeItem,
    processStockTake,
};