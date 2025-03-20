// controllers/unitOfMeasureController.js
const unitOfMeasureService = require('../services/unitOfMeasureService');
const logger = require('../utils/logger');

const createUnitOfMeasure = async (req, res) => {
    try {
        const result = await unitOfMeasureService.createUnitOfMeasure(req.body);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error('Error in createUnitOfMeasure controller:', error);
        return res.status(500).json({ message: 'Failed to create unit of measure.', error: error.message });
    }
};

const getAllUnitsOfMeasure = async (req, res) => {
    try {
        const result = await unitOfMeasureService.getAllUnitsOfMeasure();
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error('Error in getAllUnitsOfMeasure controller:', error);
        return res.status(500).json({ message: 'Failed to retrieve units of measure.', error: error.message });
    }
};

const getUnitOfMeasureById = async (req, res) => {
    try {
        const result = await unitOfMeasureService.getUnitOfMeasureById(req.params.id);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error('Error in getUnitOfMeasureById controller:', error);
        return res.status(500).json({ message: 'Failed to retrieve unit of measure.', error: error.message });
    }
};

const updateUnitOfMeasure = async (req, res) => {
    try {
        const result = await unitOfMeasureService.updateUnitOfMeasure(req.params.id, req.body);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error('Error in updateUnitOfMeasure controller:', error);
        return res.status(500).json({ message: 'Failed to update unit of measure.', error: error.message });
    }
};

const deleteUnitOfMeasure = async (req, res) => {
    try {
        const result = await unitOfMeasureService.deleteUnitOfMeasure(req.params.id);
        return res.status(result.status).send();
    } catch (error) {
        logger.error('Error in deleteUnitOfMeasure controller:', error);
        return res.status(500).json({ message: 'Failed to delete unit of measure.', error: error.message });
    }
};

module.exports = {
    createUnitOfMeasure,
    getAllUnitsOfMeasure,
    getUnitOfMeasureById,
    updateUnitOfMeasure,
    deleteUnitOfMeasure,
};