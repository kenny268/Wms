const { Inventory, Product, ProductLot, WarehouseLocation } = require('../models');

const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { handleError } = require('../utils/utils')


// Function: getAllInventory
exports.getAllInventory = async (req, res) => {
    try {
        // Validation using express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { productId, locationId, lotNumber, page = 1, limit = 20 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const where = {};
        const include = [
            { model: Product },
            { model: WarehouseLocation },
            { model: ProductLot }
        ];

        if (productId) {
            where['$ProductLot.ProductID$'] = parseInt(productId);
        }

        if (locationId) {
            where.LocationID = parseInt(locationId);
        }

        if (lotNumber) {
            include[2].where = { LotNumber: lotNumber };
        }

        const { count, rows } = await Inventory.findAndCountAll({
            where,
            include,
            offset: parseInt(offset),
            limit: parseInt(limit),
            distinct: true // Important for correct count with includes
        });

        return res.status(200).json({ count, rows });

    } catch (error) {
        handleError(res, error);
    }
}

// Function: getInventoryById
exports.getInventoryById = async (req, res) =>{
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { inventoryId } = req.params;
        const inventory = await Inventory.findByPk(inventoryId, {
            include: [Product, ProductLot, WarehouseLocation]
        });

        if (!inventory) {
            return res.status(404).json({ message: `Inventory record with ID ${inventoryId} not found.` });
        }

        return res.status(200).json(inventory);

    } catch (error) {
        handleError(res, error);
    }
}

// Function: getInventoryByProductId
exports.getInventoryByProductId = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { productId } = req.params;
        const inventoryList = await Inventory.findAll({
            include: [
                { model: Product, where: { ProductID: productId } },
                ProductLot,
                WarehouseLocation
            ]
        });

        if (inventoryList.length === 0) {
            return res.status(404).json({ message: `No inventory records found for product ID ${productId}.` });
        }

        return res.status(200).json(inventoryList);

    } catch (error) {
        handleError(res, error);
    }
}

// Function: getInventoryByLocationId
exports.getInventoryByLocationId = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { locationId } = req.params;
        const inventoryList = await Inventory.findAll({
            where: { LocationID: locationId },
            include: [Product, ProductLot, WarehouseLocation]
        });

        if (inventoryList.length === 0) {
            return res.status(404).json({ message: `No inventory records found at location ID ${locationId}.` });
        }

        return res.status(200).json(inventoryList);

    } catch (error) {
        handleError(res, error);
    }
}

// Function: getInventoryByLotNumber
exports.getInventoryByLotNumber = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { lotNumber } = req.params;
        const inventoryList = await Inventory.findAll({
            include: [
                Product,
                { model: ProductLot, where: { LotNumber: lotNumber } },
                WarehouseLocation
            ]
        });

        if (inventoryList.length === 0) {
            return res.status(404).json({ message: `No inventory records found for lot number '${lotNumber}'.` });
        }

        return res.status(200).json(inventoryList);

    } catch (error) {
        handleError(res, error);
    }
}

// Function: updateInventoryQuantity (for manual updates - use with caution)
exports.updateInventoryQuantity = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { inventoryId } = req.params;
        const { quantityOnHand } = req.body;

        const inventory = await Inventory.findByPk(inventoryId);

        if (!inventory) {
            return res.status(404).json({ message: `Inventory record with ID ${inventoryId} not found.` });
        }

        inventory.QuantityOnHand = quantityOnHand;
        await inventory.save();

        const updatedInventory = await Inventory.findByPk(inventoryId, {
            include: [Product, ProductLot, WarehouseLocation]
        });

        logger.info(`Inventory ID ${inventoryId} updated manually. New quantity on hand: ${quantityOnHand}`);
        return res.status(200).json(updatedInventory);

    } catch (error) {
        handleError(res, error);
    }
}

