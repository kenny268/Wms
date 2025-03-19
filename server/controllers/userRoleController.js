const userRoleService = require('../services/userRoleService');
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

const assignRoleToUser = async (req, res) => {
    try {
        const result = await userRoleService.assignRoleToUser(req.body);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error(`Error in assignRoleToUser controller: ${error.message}`, { body: req.body });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getUserRoles = async (req, res) => {
    try {
        const filters = {
            userId: req.query.userId,
            roleId: req.query.roleId,
        };
        const pagination = {
            page: req.query.page || 1,
            limit: req.query.limit || 20,
        };
        const result = await userRoleService.getUserRoles(filters, pagination);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error(`Error in getUserRoles controller: ${error.message}`, { query: req.query });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const removeRoleFromUser = async (req, res) => {
    try {
        const result = await userRoleService.removeRoleFromUser(req.body);
        return res.status(result.status).send(result.data || { message: result.message });
    } catch (error) {
        logger.error(`Error in removeRoleFromUser controller: ${error.message}`, { body: req.body });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getRolesForUser = async (req, res) => {
    try {
        const result = await userRoleService.getRolesForUser(req.params.userId);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error(`Error in getRolesForUser controller: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    handleValidationErrors,
    assignRoleToUser,
    getUserRoles,
    removeRoleFromUser,
    getRolesForUser,
};