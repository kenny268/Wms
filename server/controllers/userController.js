const userService = require('../services/userService');
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

const registerUser = async (req, res) => {
    try {
        const result = await userService.registerUser(req.body);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error(`Error in registerUser controller: ${error.message}`, { body: req.body });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const loginUser = async (req, res) => {
    try {
        const result = await userService.loginUser(req.body, res);
        return res.status(result.status).json({ message: result.message });
    } catch (error) {
        logger.error(`Error in loginUser controller: ${error.message}`, { body: req.body });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const filters = {
            roleId: req.query.roleId,
        };
        const pagination = {
            page: req.query.page || 1,
            limit: req.query.limit || 10,
        };
        const result = await userService.getAllUsers(filters, pagination);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error(`Error in getAllUsers controller: ${error.message}`, { query: req.query });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getUserById = async (req, res) => {
    try {
        const result = await userService.getUserById(req.params.id);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error(`Error in getUserById controller: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateUser = async (req, res) => {
    try {
        const result = await userService.updateUser(req.params.id, req.body);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error(`Error in updateUser controller: ${error.message}`, { params: req.params, body: req.body });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const result = await userService.deleteUser(req.params.id);
        return res.status(result.status).send(result.data || { message: result.message });
    } catch (error) {
        logger.error(`Error in deleteUser controller: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    handleValidationErrors,
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
};