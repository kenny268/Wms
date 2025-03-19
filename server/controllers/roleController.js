const roleService = require('../services/roleService');
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

const createRole = async (req, res) => {
    try {
        const result = await roleService.createRole(req.body);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error(`Error in createRole controller: ${error.message}`, { body: req.body });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllRoles = async (req, res) => {
    try {
        const filters = {
            roleName: req.query.roleName,
        };
        const pagination = {
            page: req.query.page || 1,
            limit: req.query.limit || 20,
        };
        const result = await roleService.getAllRoles(filters, pagination);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error(`Error in getAllRoles controller: ${error.message}`, { query: req.query });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getRoleById = async (req, res) => {
    try {
        const result = await roleService.getRoleById(req.params.id);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error(`Error in getRoleById controller: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateRole = async (req, res) => {
    try {
        const result = await roleService.updateRole(req.params.id, req.body);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error(`Error in updateRole controller: ${error.message}`, { params: req.params, body: req.body });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteRole = async (req, res) => {
    try {
        const result = await roleService.deleteRole(req.params.id);
        return res.status(result.status).send(result.data || { message: result.message });
    } catch (error) {
        logger.error(`Error in deleteRole controller: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    handleValidationErrors,
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole,
};