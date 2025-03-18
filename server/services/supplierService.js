const { Supplier } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const supplierService = {
    async createSupplier(supplierData) {
        try {
            const newSupplier = await Supplier.create(supplierData);
            logger.info(`Supplier created with ID: ${newSupplier.SupplierID}`);
            return newSupplier;
        } catch (error) {
            logger.error(`Error creating supplier: ${error.message}`, { supplierData });
            throw error;
        }
    },

    async getAllSuppliers(filters, pagination) {
        try {
            const { supplierName, city, country } = filters;
            const { page, limit } = pagination;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};

            if (supplierName) where.CompanyName = { [Op.iLike]: `%${supplierName}%` };
            if (city) where.City = { [Op.iLike]: `%${city}%` }; // Assuming a 'City' field exists in the Supplier model or a related Address model
            if (country) where.Country = { [Op.iLike]: `%${country}%` }; // Assuming a 'Country' field exists in the Supplier model or a related Address model

            const { count, rows } = await Supplier.findAndCountAll({
                where,
                offset,
                limit,
                order: [['CompanyName', 'ASC']],
            });

            return { count, rows };
        } catch (error) {
            logger.error(`Error retrieving suppliers: ${error.message}`, { filters, pagination });
            throw error;
        }
    },

    async getSupplierById(id) {
        try {
            const supplier = await Supplier.findByPk(id);
            return supplier;
        } catch (error) {
            logger.error(`Error retrieving supplier with ID ${id}: ${error.message}`);
            throw error;
        }
    },

    async updateSupplier(id, updateData) {
        try {
            const [updatedRows] = await Supplier.update(updateData, {
                where: { SupplierID: id },
            });
            if (updatedRows > 0) {
                logger.info(`Supplier with ID ${id} updated.`);
                return await Supplier.findByPk(id);
            }
            return null; // Supplier not found
        } catch (error) {
            logger.error(`Error updating supplier with ID ${id}: ${error.message}`, { updateData });
            throw error;
        }
    },

    async deleteSupplier(id) {
        try {
            const deletedRows = await Supplier.destroy({
                where: { SupplierID: id },
            });
            if (deletedRows > 0) {
                logger.info(`Supplier with ID ${id} deleted.`);
                return true;
            }
            return false; // Supplier not found
        } catch (error) {
            logger.error(`Error deleting supplier with ID ${id}: ${error.message}`);
            throw error;
        }
    },
};

module.exports = supplierService;