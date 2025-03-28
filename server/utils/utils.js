const { Address ,ProductLot, Inventory} = require('../models');
const { rateLimit } = require('express-rate-limit');

exports.createOrUpdateAddress = async (addressData, existingAddressId) => {
    if (!addressData) {
        return existingAddressId || null;
    }

    if (existingAddressId) {
        await Address.update(addressData, { where: { AddressID: existingAddressId } });
        return existingAddressId;
    } else {
        const newAddress = await Address.create(addressData);
        return newAddress.AddressID;
    }
}

// Helper function to handle validation errors
exports.handleValidationErrors = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors in request:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
    return null;
}

// Helper function for handling errors from controller logic
exports.handleErrors = (res, error) => {
    console.error(error);
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
};

// Helper function to update inventory (enhanced with transaction and break bulk handling)
exports.updateInventoryWithTransaction = async (transaction, productLotId, productId, locationId, quantityChange) => {
    try {
        const whereClause = { LocationID: locationId };
        if (productLotId) {
            whereClause.ProductLotID = productLotId;
        } else if (productId) {
            whereClause.ProductID = productId; // Track break bulk by ProductID
            whereClause.ProductLotID = null; // Ensure no lot is associated
        } else {
            throw new Error("Insufficient information to update inventory (missing ProductLotID or ProductID for break bulk).");
        }

        const inventoryRecord = await Inventory.findOne({
            where: whereClause,
            transaction,
        });

        if (inventoryRecord) {
            await inventoryRecord.increment('QuantityOnHand', { by: quantityChange, transaction });
        } else if (quantityChange > 0) {
            const createPayload = { LocationID: locationId, QuantityOnHand: quantityChange };
            if (productLotId) {
                createPayload.ProductLotID = productLotId;
            } else if (productId) {
                createPayload.ProductID = productId;
                createPayload.ProductLotID = null;
            }
            await Inventory.create(createPayload, { transaction });
        }
    } catch (error) {
        console.error('Error updating inventory:', error);
        throw error;
    }
};

// Helper function to create or find ProductLot (dynamic for break bulk)
exports.findOrCreateProductLot = async (transaction, ProductID, LotNumber, ExpirationDate, IsBreakBulk) => {
    if (IsBreakBulk || !LotNumber) {
        return null; // No ProductLot for break bulk
    }
    const [productLot, created] = await ProductLot.findOrCreate({
        where: { ProductID, LotNumber },
        defaults: { ExpirationDate },
        transaction,
    });
    return productLot;
};

// Rate limiter for registration
exports.registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 5, // Limit each IP to 5 create account requests per windowMs
    message: 'Too many account creation requests from this IP, please try again after an hour',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Rate limiter for login
exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minute window
    max: 20, // Limit each IP to 20 login requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});


