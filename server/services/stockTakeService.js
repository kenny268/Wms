const { StockTake, StockTakeItem, Inventory, Product, WarehouseLocation, User, ProductLot } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const logger = require('../utils/logger');

const stockTakeService = {
    async createStockTake(stockTakeData) {
        const transaction = await sequelize.transaction();
        try {
            const { stockTakeItems, ...stockTakeDetails } = stockTakeData;
            const stockTake = await StockTake.create(stockTakeDetails, { transaction });

            if (stockTakeItems && stockTakeItems.length > 0) {
                for (const item of stockTakeItems) {
                    const productLot = await ProductLot.findOne({
                        where: { ProductID: item.ProductID, LotNumber: item.LotNumber },
                        transaction,
                    });
                    if (!productLot) {
                        throw new Error(`Product Lot not found for Product ID: ${item.ProductID} and Lot Number: ${item.LotNumber}`);
                    }
                    await StockTakeItem.create({
                        StockTakeID: stockTake.StockTakeID,
                        ProductLotID: productLot.ProductLotID,
                        LocationID: item.LocationID,
                        CountedQuantity: item.CountedQuantity || 0,
                        AssignedToUserID: item.AssignedToUserID,
                    }, { transaction });
                }
            }

            await transaction.commit();
            logger.info(`Stock take created with ID: ${stockTake.StockTakeID}`);
            return await StockTake.findByPk(stockTake.StockTakeID, { include: [StockTakeItem] });
        } catch (error) {
            await transaction.rollback();
            logger.error(`Error creating stock take: ${error.message}`, { stockTakeData });
            throw error;
        }
    },

    async initiateStockTakeFromInventory(initiateData) {
        const transaction = await sequelize.transaction();
        try {
            const { filterByLocation, filterByProduct, ...stockTakeDetails } = initiateData;
            const stockTake = await StockTake.create(stockTakeDetails, { transaction });
            const whereClause = {};
            if (filterByLocation) whereClause.LocationID = filterByLocation;
            if (filterByProduct) whereClause.ProductID = filterByProduct;

            const inventoryRecords = await Inventory.findAll({
                include: [ProductLot],
                where: whereClause,
                transaction,
            });

            const stockTakeItemsToCreate = inventoryRecords.map(inventory => ({
                StockTakeID: stockTake.StockTakeID,
                ProductLotID: inventory.ProductLotID,
                LocationID: inventory.LocationID,
                ExpectedQuantity: inventory.QuantityOnHand, // Consider current on-hand as expected
                CountedQuantity: 0,
            }));

            await StockTakeItem.bulkCreate(stockTakeItemsToCreate, { transaction });

            await transaction.commit();
            logger.info(`Stock take initiated from inventory with ID: ${stockTake.StockTakeID}`);
            return await StockTake.findByPk(stockTake.StockTakeID, { include: [StockTakeItem] });
        } catch (error) {
            await transaction.rollback();
            logger.error(`Error initiating stock take from inventory: ${error.message}`, { initiateData });
            throw error;
        }
    },

    async getAllStockTakes(filters, pagination) {
        try {
            const { stockTakeStatus, startDate, endDate } = filters;
            const { page, limit } = pagination;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};

            if (stockTakeStatus) where.Status = stockTakeStatus;
            if (startDate && endDate) where.StartDate = { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) };
            else if (startDate) where.StartDate = { [Op.gte]: new Date(startDate) };
            else if (endDate) where.StartDate = { [Op.lte]: new Date(endDate) };

            const { count, rows } = await StockTake.findAndCountAll({
                where,
                include: [{ model: User, as: 'InitiatedByUser' }],
                offset,
                limit,
                order: [['StartDate', 'DESC']],
            });

            return { count, rows };
        } catch (error) {
            logger.error(`Error retrieving stock takes: ${error.message}`, { filters, pagination });
            throw error;
        }
    },

    async getStockTakeById(id) {
        try {
            const stockTake = await StockTake.findByPk(id, {
                include: [
                    { model: StockTakeItem, include: [ProductLot, Product, WarehouseLocation, { model: User, as: 'CountedByUser' }] },
                    { model: User, as: 'InitiatedByUser' },
                ],
            });
            return stockTake;
        } catch (error) {
            logger.error(`Error retrieving stock take with ID ${id}: ${error.message}`);
            throw error;
        }
    },

    async updateStockTake(id, updateData) {
        try {
            const [updatedRows] = await StockTake.update(updateData, {
                where: { StockTakeID: id },
            });
            if (updatedRows > 0) {
                logger.info(`Stock take with ID ${id} updated.`);
                return await StockTake.findByPk(id);
            }
            return null; // Stock take not found
        } catch (error) {
            logger.error(`Error updating stock take with ID ${id}: ${error.message}`, { updateData });
            throw error;
        }
    },

    async deleteStockTake(id) {
        const transaction = await sequelize.transaction();
        try {
            const stockTake = await StockTake.findByPk(id, { transaction });
            if (!stockTake) {
                return false; // Stock take not found
            }

            await StockTakeItem.destroy({ where: { StockTakeID: id }, transaction });
            await stockTake.destroy({ transaction });

            await transaction.commit();
            logger.info(`Stock take with ID ${id} deleted.`);
            return true;
        } catch (error) {
            await transaction.rollback();
            logger.error(`Error deleting stock take with ID ${id}: ${error.message}`);
            throw error;
        }
    },

    async addStockTakeItem(stockTakeId, itemData) {
        try {
            const stockTake = await StockTake.findByPk(stockTakeId);
            if (!stockTake) {
                throw new Error(`Stock take with ID ${stockTakeId} not found.`);
            }
            const productLot = await ProductLot.findOne({
                where: { ProductID: itemData.ProductID, LotNumber: itemData.LotNumber },
            });
            if (!productLot) {
                throw new Error(`Product Lot not found for Product ID: ${itemData.ProductID} and Lot Number: ${itemData.LotNumber}`);
            }
            const location = await WarehouseLocation.findByPk(itemData.LocationID);
            if (!location) {
                throw new Error(`Warehouse location with ID ${itemData.LocationID} not found.`);
            }

            const newStockTakeItem = await StockTakeItem.create({
                StockTakeID: stockTakeId,
                ProductLotID: productLot.ProductLotID,
                LocationID: itemData.LocationID,
                CountedQuantity: itemData.CountedQuantity || 0,
                AssignedToUserID: itemData.AssignedToUserID,
            });

            logger.info(`Item added to stock take ${stockTakeId}, Item ID: ${newStockTakeItem.StockTakeItemID}`);
            return newStockTakeItem;
        } catch (error) {
            logger.error(`Error adding item to stock take ${stockTakeId}: ${error.message}`, { itemData });
            throw error;
        }
    },

    async getAllStockTakeItems(stockTakeId) {
        try {
            const items = await StockTakeItem.findAll({
                where: { StockTakeID: stockTakeId },
                include: [ProductLot, Product, WarehouseLocation, { model: User, as: 'CountedByUser' }],
            });
            return items;
        } catch (error) {
            logger.error(`Error retrieving stock take items for stock take ${stockTakeId}: ${error.message}`);
            throw error;
        }
    },

    async getStockTakeItemById(itemId) {
        try {
            const item = await StockTakeItem.findByPk(itemId, {
                include: [ProductLot, Product, WarehouseLocation, { model: User, as: 'CountedByUser' }],
            });
            return item;
        } catch (error) {
            logger.error(`Error retrieving stock take item with ID ${itemId}: ${error.message}`);
            throw error;
        }
    },

    async updateStockTakeItem(itemId, updateData) {
        try {
            const [updatedRows] = await StockTakeItem.update(updateData, {
                where: { StockTakeItemID: itemId },
            });
            if (updatedRows > 0) {
                logger.info(`Stock take item with ID ${itemId} updated.`);
                return await StockTakeItem.findByPk(itemId);
            }
            return null; // Stock take item not found
        } catch (error) {
            logger.error(`Error updating stock take item with ID ${itemId}: ${error.message}`, { updateData });
            throw error;
        }
    },

    async deleteStockTakeItem(itemId) {
        try {
            const deletedRows = await StockTakeItem.destroy({
                where: { StockTakeItemID: itemId },
            });
            if (deletedRows > 0) {
                logger.info(`Stock take item with ID ${itemId} deleted.`);
                return true;
            }
            return false;
        } catch (error) {
            logger.error(`Error deleting stock take item with ID ${itemId}: ${error.message}`);
            throw error;
        }
    },

    async processStockTake(stockTakeId) {
        const transaction = await sequelize.transaction();
        try {
            const stockTake = await StockTake.findByPk(stockTakeId, {
                include: [{ model: StockTakeItem, include: [ProductLot, { model: Inventory }] }],
                transaction,
            });

            if (!stockTake) {
                throw new Error(`Stock take with ID ${stockTakeId} not found.`);
            }

            if (stockTake.Status !== 'InProgress') {
                throw new Error(`Stock take with ID ${stockTakeId} must be in 'InProgress' status to be processed.`);
            }

            for (const item of stockTake.StockTakeItems) {
                const inventory = await Inventory.findOne({
                    where: { ProductLotID: item.ProductLotID, LocationID: item.LocationID },
                    transaction,
                });

                if (inventory) {
                    const discrepancy = (item.ExpectedQuantity || inventory.QuantityOnHand) - item.CountedQuantity;
                    if (discrepancy !== 0) {
                        // Log the discrepancy for auditing
                        logger.warn(`Stock take discrepancy found for ProductLot ID: ${item.ProductLotID}, Location ID: ${item.LocationID}. Expected: ${item.ExpectedQuantity || inventory.QuantityOnHand}, Counted: ${item.CountedQuantity}, Discrepancy: ${discrepancy}`);
                        // Update inventory quantity (you might want to create stock movement records here for audit)
                        await inventory.update({ QuantityOnHand: item.CountedQuantity, LastStockTakeDate: new Date() }, { transaction });
                        await item.update({ Discrepancy: discrepancy }, { transaction });
                    } else {
                        await item.update({ Discrepancy: 0 }, { transaction });
                    }
                } else {
                    logger.warn(`Inventory record not found for StockTakeItem ID: ${item.StockTakeItemID}, ProductLot ID: ${item.ProductLotID}, Location ID: ${item.LocationID}. Counted quantity: ${item.CountedQuantity}`);
                    // Optionally handle cases where inventory doesn't exist (e.g., create a new inventory record?)
                }
            }

            await stockTake.update({ Status: 'Completed', EndDate: new Date() }, { transaction });
            await transaction.commit();
            logger.info(`Stock take with ID ${stockTakeId} processed.`);
            return await StockTake.findByPk(stockTakeId, { include: [StockTakeItem] });
        } catch (error) {
            await transaction.rollback();
            logger.error(`Error processing stock take with ID ${stockTakeId}: ${error.message}`);
            if (error.message.includes('not found') || error.message.includes('must be in')) {
                return { status: 400, message: error.message };
            }
            return { status: 500, message: error.message || 'Internal Server Error' };
        }
    },
};

module.exports = stockTakeService;