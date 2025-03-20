// services/unitOfMeasureService.js
const { UnitOfMeasure } = require('../models');
const logger = require('../utils/logger');

const unitOfMeasureService = {
    async createUnitOfMeasure(uomData) {
        try {
            const newUOM = await UnitOfMeasure.create(uomData);
            logger.info(`Unit of Measure created with ID: ${newUOM.UOMID}`);
            return { status: 201, data: newUOM };
        } catch (error) {
            logger.error('Error creating Unit of Measure:', error);
            return { status: 500, message: 'Failed to create Unit of Measure.', error: error.message };
        }
    },

    async getAllUnitsOfMeasure() {
        try {
            const uoms = await UnitOfMeasure.findAll();
            return { status: 200, data: uoms };
        } catch (error) {
            logger.error('Error retrieving Units of Measure:', error);
            return { status: 500, message: 'Failed to retrieve Units of Measure.', error: error.message };
        }
    },

    async getUnitOfMeasureById(id) {
        try {
            const uom = await UnitOfMeasure.findByPk(id);
            if (!uom) {
                return { status: 404, message: `Unit of Measure with ID ${id} not found.` };
            }
            return { status: 200, data: uom };
        } catch (error) {
            logger.error('Error retrieving Unit of Measure by ID:', error);
            return { status: 500, message: 'Failed to retrieve Unit of Measure.', error: error.message };
        }
    },

    async updateUnitOfMeasure(id, updateData) {
        try {
            const [updatedRows] = await UnitOfMeasure.update(updateData, {
                where: { UOMID: id },
            });
            if (updatedRows === 0) {
                return { status: 404, message: `Unit of Measure with ID ${id} not found.` };
            }
            const updatedUOM = await UnitOfMeasure.findByPk(id);
            logger.info(`Unit of Measure with ID ${id} updated.`);
            return { status: 200, data: updatedUOM };
        } catch (error) {
            logger.error('Error updating Unit of Measure:', error);
            return { status: 500, message: 'Failed to update Unit of Measure.', error: error.message };
        }
    },

    async deleteUnitOfMeasure(id) {
        try {
            const deletedRows = await UnitOfMeasure.destroy({
                where: { UOMID: id },
            });
            if (deletedRows === 0) {
                return { status: 404, message: `Unit of Measure with ID ${id} not found.` };
            }
            logger.info(`Unit of Measure with ID ${id} deleted.`);
            return { status: 204 };
        } catch (error) {
            logger.error('Error deleting Unit of Measure:', error);
            return { status: 500, message: 'Failed to delete Unit of Measure.', error: error.message };
        }
    },
};

module.exports = unitOfMeasureService;