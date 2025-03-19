const warehouseLocationService = require('../services/warehouseLocationService');
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

const createWarehouseLocation = async (req, res) => {
    try {
        const newLocation = await warehouseLocationService.createWarehouseLocation(req.body);
        return res.status(201).json(newLocation);
    } catch (error) {
        logger.error(`Error creating warehouse location: ${error.message}`, { body: req.body });
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Warehouse location with this code already exists.' });
        }
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getAllWarehouseLocations = async (req, res) => {
    try {
        const filters = {
            locationCode: req.query.locationCode,
            locationType: req.query.locationType,
        };
        const pagination = {
            page: req.query.page || 1,
            limit: req.query.limit || 20,
        };
        const { count, rows } = await warehouseLocationService.getAllWarehouseLocations(filters, pagination);
        return res.status(200).json({ count, rows });
    } catch (error) {
        logger.error(`Error retrieving warehouse locations: ${error.message}`, { query: req.query });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getWarehouseLocationById = async (req, res) => {
    try {
        const location = await warehouseLocationService.getWarehouseLocationById(req.params.id);
        if (!location) {
            return res.status(404).json({ message: `Warehouse location with ID ${req.params.id} not found.` });
        }
        return res.status(200).json(location);
    } catch (error) {
        logger.error(`Error retrieving warehouse location by ID: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const updateWarehouseLocation = async (req, res) => {
    try {
        const updatedLocation = await warehouseLocationService.updateWarehouseLocation(req.params.id, req.body);
        if (!updatedLocation) {
            return res.status(404).json({ message: `Warehouse location with ID ${req.params.id} not found.` });
        }
        return res.status(200).json(updatedLocation);
    } catch (error) {
        logger.error(`Error updating warehouse location: ${error.message}`, { params: req.params, body: req.body });
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Warehouse location with this code already exists.' });
        }
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const deleteWarehouseLocation = async (req, res) => {
    try {
        const isDeleted = await warehouseLocationService.deleteWarehouseLocation(req.params.id);
        if (!isDeleted) {
            return res.status(404).json({ message: `Warehouse location with ID ${req.params.id} not found.` });
        }
        return res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting warehouse location: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

module.exports = {
    handleValidationErrors,
    createWarehouseLocation,
    getAllWarehouseLocations,
    getWarehouseLocationById,
    updateWarehouseLocation,
    deleteWarehouseLocation,
};