const express = require('express');
const router = express.Router();
const { StockMovement, Inventory, Product, WarehouseLocation, User, ProductLot } = require('../models');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { body, param, query, validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize = require('../config/db'); // Import Sequelize instance

// Function to handle errors and send a consistent error response
const handleError = (res, error, statusCode = 500) => {
    logger.error(error);
    return res.status(statusCode).json({ error: error.message || 'Internal Server Error' });
};

// Function: createStockTransfer
exports.createStockTransfer = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { ProductID, FromLocationID, ToLocationID, Quantity, UserID, ProductLotID, Reason } = req.body;

        if (FromLocationID === ToLocationID) {
            return res.status(400).json({ message: 'Cannot transfer stock to the same location.' });
        }

        // Find source inventory
        const sourceInventory = await Inventory.findOne({
            where: {
                ProductID: ProductID,
                LocationID: FromLocationID,
                ProductLotID: ProductLotID || null // Handle optional ProductLotID
            },
            transaction
        });

        if (!sourceInventory) {
            return res.status(404).json({ message: 'Source inventory not found.' });
        }

        if (sourceInventory.QuantityOnHand < Quantity) {
            return res.status(409).json({ message: 'Insufficient inventory at the source location.' });
        }

        // Create stock movement record
        const stockMovement = await StockMovement.create({
            MovementType: 'Transfer',
            ProductID: ProductID,
            FromLocationID: FromLocationID,
            ToLocationID: ToLocationID,
            Quantity: Quantity,
            UserID: UserID,
            ProductLotID: ProductLotID || null,
            Reason: Reason,
        }, { transaction });

        // Decrement quantity at source
        await sourceInventory.update({ QuantityOnHand: sourceInventory.QuantityOnHand - Quantity }, { transaction });

        // Find destination inventory
        let destinationInventory = await Inventory.findOne({
            where: {
                ProductID: ProductID,
                LocationID: ToLocationID,
                ProductLotID: ProductLotID || null
            },
            transaction
        });

        // Increment quantity at destination or create new
        if (destinationInventory) {
            await destinationInventory.update({ QuantityOnHand: destinationInventory.QuantityOnHand + Quantity }, { transaction });
        } else {
            await Inventory.create({
                ProductID: ProductID,
                LocationID: ToLocationID,
                ProductLotID: ProductLotID || null,
                QuantityOnHand: Quantity,
                QuantityAllocated: 0, // Assuming initial allocated quantity is 0
            }, { transaction });
        }

        await transaction.commit();
        logger.info(`Stock transfer recorded: Product ID ${ProductID}, from Location ${FromLocationID} to ${ToLocationID}, Quantity ${Quantity}, User ${UserID}, Lot ${ProductLotID || 'N/A'}`);
        return res.status(201).json(stockMovement);

    } catch (error) {
        await transaction.rollback();
        handleError(res, error);
    }
}

// Function: createInventoryAdjustment
exports.createInventoryAdjustment = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { ProductID, LocationID, Quantity, UserID, ProductLotID, Reason } = req.body;

        // Find inventory record
        const inventory = await Inventory.findOne({
            where: {
                ProductID: ProductID,
                LocationID: LocationID,
                ProductLotID: ProductLotID || null
            },
            transaction
        });

        // Create stock movement record
        const stockMovement = await StockMovement.create({
            MovementType: 'Adjustment',
            ProductID: ProductID,
            LocationID: LocationID,
            Quantity: Quantity,
            UserID: UserID,
            ProductLotID: ProductLotID || null,
            Reason: Reason,
        }, { transaction });

        if (inventory) {
            await inventory.update({ QuantityOnHand: inventory.QuantityOnHand + Quantity }, { transaction });
        } else if (Quantity > 0) {
            // If no inventory exists and it's a positive adjustment, create a new record
            await Inventory.create({
                ProductID: ProductID,
                LocationID: LocationID,
                ProductLotID: ProductLotID || null,
                QuantityOnHand: Quantity,
                QuantityAllocated: 0, // Assuming initial allocated quantity is 0
            }, { transaction });
        } else {
            // Handle negative adjustment when no inventory exists (you might want to customize this)
            await transaction.rollback();
            return res.status(400).json({ message: 'Cannot perform a negative adjustment on non-existent inventory. Create the inventory record first or adjust the logic.' });
        }

        await transaction.commit();
        logger.info(`Inventory adjustment recorded: Product ID ${ProductID}, Location ${LocationID}, Quantity ${Quantity}, User ${UserID}, Lot ${ProductLotID || 'N/A'}, Reason: ${Reason}`);
        return res.status(201).json(stockMovement);

    } catch (error) {
        await transaction.rollback();
        handleError(res, error);
    }
}

// Function: getAllStockMovements
exports.getAllStockMovements = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { productId, fromLocationId, toLocationId, movementType, startDate, endDate, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        const include = [
            { model: Product },
            { model: WarehouseLocation, as: 'FromLocation' },
            { model: WarehouseLocation, as: 'ToLocation' },
            { model: User },
            { model: ProductLot }
        ];

        if (productId) {
            where.ProductID = parseInt(productId);
        }
        if (fromLocationId) {
            where.FromLocationID = parseInt(fromLocationId);
        }
        if (toLocationId) {
            where.ToLocationID = parseInt(toLocationId);
        }
        if (movementType) {
            where.MovementType = movementType;
        }
        if (startDate && endDate) {
            where.MovementDate = {
                [Op.gte]: new Date(startDate),
                [Op.lte]: new Date(endDate),
            };
        } else if (startDate) {
            where.MovementDate = { [Op.gte]: new Date(startDate) };
        } else if (endDate) {
            where.MovementDate = { [Op.lte]: new Date(endDate) };
        }

        const { count, rows } = await StockMovement.findAndCountAll({
            where,
            include,
            offset: parseInt(offset),
            limit: parseInt(limit),
            order: [['MovementDate', 'DESC']] // Default ordering
        });

        return res.status(200).json({ count, rows });

    } catch (error) {
        handleError(res, error);
    }
}

// Function: getStockMovementById
exports.getStockMovementById = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const stockMovement = await StockMovement.findByPk(id, {
            include: [
                { model: Product },
                { model: WarehouseLocation, as: 'FromLocation' },
                { model: WarehouseLocation, as: 'ToLocation' },
                { model: User },
                { model: ProductLot }
            ]
        });

        if (!stockMovement) {
            return res.status(404).json({ message: `Stock movement record with ID ${id} not found.` });
        }

        return res.status(200).json(stockMovement);

    } catch (error) {
        handleError(res, error);
    }
}

