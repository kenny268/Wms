const supplierService = require('../services/supplierService');
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

const createSupplier = async (req, res) => {
    try {
        const newSupplier = await supplierService.createSupplier(req.body);
        return res.status(201).json(newSupplier);
    } catch (error) {
        logger.error(`Error creating supplier: ${error.message}`, { body: req.body });
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Supplier with this name already exists.' });
        }
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getAllSuppliers = async (req, res) => {
    try {
        const filters = {
            supplierName: req.query.supplierName,
            city: req.query.city,
            country: req.query.country,
        };
        const pagination = {
            page: req.query.page || 1,
            limit: req.query.limit || 20,
        };
        const { count, rows } = await supplierService.getAllSuppliers(filters, pagination);
        return res.status(200).json({ count, rows });
    } catch (error) {
        logger.error(`Error retrieving suppliers: ${error.message}`, { query: req.query });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getSupplierById = async (req, res) => {
    try {
        const supplier = await supplierService.getSupplierById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: `Supplier with ID ${req.params.id} not found.` });
        }
        return res.status(200).json(supplier);
    } catch (error) {
        logger.error(`Error retrieving supplier by ID: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const updatedSupplier = await supplierService.updateSupplier(req.params.id, req.body);
        if (!updatedSupplier) {
            return res.status(404).json({ message: `Supplier with ID ${req.params.id} not found.` });
        }
        return res.status(200).json(updatedSupplier);
    } catch (error) {
        logger.error(`Error updating supplier: ${error.message}`, { params: req.params, body: req.body });
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Supplier with this name already exists.' });
        }
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        const isDeleted = await supplierService.deleteSupplier(req.params.id);
        if (!isDeleted) {
            return res.status(404).json({ message: `Supplier with ID ${req.params.id} not found.` });
        }
        return res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting supplier: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

module.exports = {
    handleValidationErrors,
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
};