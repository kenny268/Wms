const { WarehouseLocation } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const warehouseLocationService = {
    async createWarehouseLocation(locationData) {
        try {
            const newLocation = await WarehouseLocation.create(locationData);
            logger.info(`Warehouse location created with ID: ${newLocation.LocationID}`);
            return newLocation;
        } catch (error) {
            logger.error(`Error creating warehouse location: ${error.message}`, { locationData });
            throw error;
        }
    },

    async getAllWarehouseLocations(filters, pagination) {
        try {
            const { locationCode, locationType } = filters;
            const { page, limit } = pagination;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};

            if (locationCode) where.LocationCode = { [Op.iLike]: `%${locationCode}%` };
            if (locationType) where.LocationType = locationType; // Exact match for LocationType

            const { count, rows } = await WarehouseLocation.findAndCountAll({
                where,
                offset,
                limit,
                order: [['LocationCode', 'ASC']],
            });

            return { count, rows };
        } catch (error) {
            logger.error(`Error retrieving warehouse locations: ${error.message}`, { filters, pagination });
            throw error;
        }
    },

    async getWarehouseLocationById(id) {
        try {
            const location = await WarehouseLocation.findByPk(id);
            return location;
        } catch (error) {
            logger.error(`Error retrieving warehouse location with ID ${id}: ${error.message}`);
            throw error;
        }
    },

    async updateWarehouseLocation(id, updateData) {
        try {
            const [updatedRows] = await WarehouseLocation.update(updateData, {
                where: { LocationID: id },
            });
            if (updatedRows > 0) {
                logger.info(`Warehouse location with ID ${id} updated.`);
                return await WarehouseLocation.findByPk(id);
            }
            return null; // Location not found
        } catch (error) {
            logger.error(`Error updating warehouse location with ID ${id}: ${error.message}`, { updateData });
            throw error;
        }
    },

    async deleteWarehouseLocation(id) {
        try {
            const deletedRows = await WarehouseLocation.destroy({
                where: { LocationID: id },
            });
            if (deletedRows > 0) {
                logger.info(`Warehouse location with ID ${id} deleted.`);
                return true;
            }
            return false; // Location not found
        } catch (error) {
            logger.error(`Error deleting warehouse location with ID ${id}: ${error.message}`);
            throw error;
        }
    },
};

module.exports = warehouseLocationService;