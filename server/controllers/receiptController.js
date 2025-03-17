// receivingController.js

const { Receipt, ReceiptLineItem, PurchaseOrder, PurchaseOrderLineItem, ProductLot, Inventory, User, WarehouseLocation } = require('../models'); // Adjust path as needed
const { Op } = require('sequelize');
const { body, param, query, validationResult } = require('express-validator');
const { handleErrors,handleValidationErrors, updateInventoryWithTransaction, findOrCreateProductLot } = require('../validations/receivingValidation');

// --- Dynamic Controller Functions with Validation ---

// Create a new receipt, handling both lot-tracked and break bulk items
exports.createReceipt = async (req, res) => {
    const transaction = await req.sequelize.transaction(); // Assuming you have sequelize instance in req
    try {
        const {
            PONumber,
            ReceiptDate,
            CarrierName,
            TrackingNumber,
            ReceiverUserID,
            ConditionOnArrival,
            receivedItems,
            // ... other Receipt fields
        } = req.body;

        const purchaseOrder = await PurchaseOrder.findOne({
            where: { PONumber },
            include: [{ model: PurchaseOrderLineItem, as: 'PurchaseOrderLineItems' }],
            transaction,
        });

        if (!purchaseOrder && PONumber) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Purchase Order not found.' });
        }

        const receiptPayload = { ...req.body };
        delete receiptPayload.receivedItems; // Remove receivedItems from the main receipt payload
        receiptPayload.PurchaseOrderID = purchaseOrder ? purchaseOrder.PurchaseOrderID : null;

        const receipt = await Receipt.create(receiptPayload, { transaction });
        const receiptLineItems = [];

        for (const receivedItem of receivedItems) {
            const { ProductID, ReceivedQuantity, UnitOfMeasure, LotNumber, ExpirationDate, LocationID, IsBreakBulk = false } = receivedItem;

            const poLineItem = purchaseOrder?.PurchaseOrderLineItems?.find(item => item.ProductID === ProductID);
            // Consider how to handle break bulk items that might not have a direct PO line item

            const productLot = await findOrCreateProductLot(transaction, ProductID, LotNumber, ExpirationDate, IsBreakBulk);
            const productLotId = productLot ? productLot.ProductLotID : null;

            const receiptLineItem = await ReceiptLineItem.create({
                ReceiptID: receipt.ReceiptID,
                ProductID,
                ExpectedQuantity: poLineItem ? poLineItem.QuantityOrdered : 0, // Get expected from PO if available
                ReceivedQuantity,
                UnitOfMeasure,
                LotNumber,
                ExpirationDate,
                LocationID,
                IsBreakBulk,
                PurchaseOrderLineItemID: poLineItem ? poLineItem.PurchaseOrderLineItemID : null,
            }, { transaction });
            receiptLineItems.push(receiptLineItem);

            if (productLotId && LocationID) {
                await updateInventoryWithTransaction(transaction, productLotId, null, LocationID, ReceivedQuantity);
            } else if (IsBreakBulk && LocationID) {
                await updateInventoryWithTransaction(transaction, null, ProductID, LocationID, ReceivedQuantity);
            } else if (!LotNumber && !IsBreakBulk) {
                console.warn(`Inventory not updated for ProductID ${ProductID} as LotNumber is missing and it's not marked as break bulk.`);
            }
        }

        await transaction.commit();
        return res.status(201).json({ receipt, receiptLineItems });

    } catch (error) {
        await transaction.rollback();
        handleErrors(res, error);
    }
};

// Get a list of all receipts with enhanced filtering and pagination
exports.getAllReceipts = async (req, res) => {
    try {
        const { poNumber, startDate, endDate, limit = 10, offset = 0, ...otherFilters } = req.query;
        const whereClause = {};
        const includeOptions = [{ model: ReceiptLineItem, as: 'ReceiptLineItems' }];

        if (poNumber) {
            whereClause.PONumber = { [Op.like]: `%${poNumber}%` };
        }

        if (startDate && endDate) {
            whereClause.ReceiptDate = { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) };
        } else if (startDate) {
            whereClause.ReceiptDate = { [Op.gte]: new Date(startDate) };
        } else if (endDate) {
            whereClause.ReceiptDate = { [Op.lte]: new Date(endDate) };
        }

        // Add other filters from the query parameters
        for (const key in otherFilters) {
            if (Object.prototype.hasOwnProperty.call(otherFilters, key)) {
                whereClause[key] = otherFilters[key];
            }
        }

        const { count, rows: receipts } = await Receipt.findAndCountAll({
            where: whereClause,
            include: includeOptions,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['ReceiptDate', 'DESC']], // Default ordering
        });

        return res.status(200).json({ total: count, limit: parseInt(limit), offset: parseInt(offset), receipts });

    } catch (error) {
        handleErrors(res, error);
    }
};

// Get details of a specific receipt with all associated data
exports.getReceiptById = async (req, res) => {
    try {
        const { id } = req.params;
        const receipt = await Receipt.findByPk(id, {
            include: [
                { model: ReceiptLineItem, as: 'ReceiptLineItems' },
                { model: PurchaseOrder, as: 'PurchaseOrder' },
                { model: User, as: 'Receiver' }, // Assuming alias 'Receiver' in your association
                { model: User, as: 'Inspector' }, // Assuming alias 'Inspector' in your association
                { model: Supplier, as: 'Supplier' }, // Assuming alias 'Supplier' in your association
            ],
        });
        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found.' });
        }
        return res.status(200).json(receipt);
    } catch (error) {
        handleErrors(res, error);
    }
};

// Update an existing receipt (more comprehensive checks and logic)
exports.updateReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const { receivedItems, ...receiptUpdates } = req.body;

        const receipt = await Receipt.findByPk(id);
        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found.' });
        }

        await Receipt.update(receiptUpdates, { where: { ReceiptID: id } });

        if (receivedItems && Array.isArray(receivedItems)) {
            console.warn('Updating receivedItems through the main receipt update is not recommended. Use the line item specific routes.');
        }

        const updatedReceipt = await Receipt.findByPk(id);
        return res.status(200).json(updatedReceipt);

    } catch (error) {
        handleErrors(res, error);
    }
};

// Delete a specific receipt (consider implications on line items and inventory)
exports.deleteReceipt = async (req, res) => {
    const transaction = await req.sequelize.transaction();
    try {
        const { id } = req.params;
        const receipt = await Receipt.findByPk(id, {
            include: [{ model: ReceiptLineItem, as: 'ReceiptLineItems' }],
            transaction,
        });

        if (!receipt) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Receipt not found.' });
        }

        // Adjust inventory for each line item before deleting
        for (const lineItem of receipt.ReceiptLineItems) {
            if (!lineItem.IsBreakBulk && lineItem.LotNumber && lineItem.LocationID) {
                const productLot = await ProductLot.findOne({ where: { ProductID: lineItem.ProductID, LotNumber: lineItem.LotNumber }, transaction });
                if (productLot) {
                    await updateInventoryWithTransaction(transaction, productLot.ProductLotID, null, lineItem.LocationID, -lineItem.ReceivedQuantity);
                }
            } else if (lineItem.IsBreakBulk && lineItem.LocationID) {
                await updateInventoryWithTransaction(transaction, null, lineItem.ProductID, lineItem.LocationID, -lineItem.ReceivedQuantity);
            }
        }

        await ReceiptLineItem.destroy({ where: { ReceiptID: id }, transaction });
        await Receipt.destroy({ where: { ReceiptID: id }, transaction });

        await transaction.commit();
        return res.status(204).send();

    } catch (error) {
        await transaction.rollback();
        handleErrors(res, error);
    }
};

// Add a new line item to a receipt (with more validation and inventory update)
exports.addReceiptLineItem = async (req, res) => {
    const transaction = await req.sequelize.transaction();
    try {
        const { receiptId } = req.params;
        const { ProductID, ReceivedQuantity, UnitOfMeasure, LotNumber, ExpirationDate, LocationID, ExpectedQuantity, PurchaseOrderLineItemID, IsBreakBulk = false } = req.body;

        const receipt = await Receipt.findByPk(receiptId, { transaction });
        if (!receipt) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Receipt not found.' });
        }

        const product = await Product.findByPk(ProductID, { transaction });
        if (!product) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Product not found.' });
        }

        const location = await WarehouseLocation.findByPk(LocationID, { transaction });
        if (!location) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Location not found.' });
        }

        const productLot = await findOrCreateProductLot(transaction, ProductID, LotNumber, ExpirationDate, IsBreakBulk);
        const productLotId = productLot ? productLot.ProductLotID : null;

        const newReceiptLineItem = await ReceiptLineItem.create({
            ReceiptID: parseInt(receiptId),
            ProductID,
            ExpectedQuantity: ExpectedQuantity || 0,
            ReceivedQuantity,
            UnitOfMeasure,
            LotNumber,
            ExpirationDate,
            LocationID,
            IsBreakBulk,
            PurchaseOrderLineItemID,
        }, { transaction });

        if (productLotId && LocationID) {
            await updateInventoryWithTransaction(transaction, productLotId, null, LocationID, ReceivedQuantity);
        } else if (IsBreakBulk && LocationID) {
            await updateInventoryWithTransaction(transaction, null, ProductID, LocationID, ReceivedQuantity);
        } else if (!LotNumber && !IsBreakBulk) {
            console.warn(`Inventory not updated for ProductID ${ProductID} in Receipt ${receiptId} as LotNumber is missing and it's not marked as break bulk.`);
        }

        await transaction.commit();
        return res.status(201).json(newReceiptLineItem);

    } catch (error) {
        await transaction.rollback();
        handleErrors(res, error);
    }
};

// Get all line items for a specific receipt
exports.getAllReceiptLineItems = async (req, res) => {
    try {
        const { receiptId } = req.params;
        const receipt = await Receipt.findByPk(receiptId);
        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found.' });
        }
        const lineItems = await ReceiptLineItem.findAll({
            where: { ReceiptID: receiptId },
        });
        return res.status(200).json(lineItems);
    } catch (error) {
        handleErrors(res, error);
    }
};

// Update a specific receipt line item (with inventory adjustments and more checks)
exports.updateReceiptLineItem = async (req, res) => {
    const transaction = await req.sequelize.transaction();
    try {
        const { lineItemId } = req.params;
        const { ReceivedQuantity: newReceivedQuantity, LocationID: newLocationID, ProductID: newProductID, LotNumber: newLotNumber, ExpirationDate: newExpirationDate, IsBreakBulk: newIsBreakBulk, ...updates } = req.body;

        const lineItem = await ReceiptLineItem.findByPk(lineItemId, { transaction });
        if (!lineItem) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Receipt Line Item not found.' });
        }

        const oldReceivedQuantity = lineItem.ReceivedQuantity;
        const oldLocationID = lineItem.LocationID;
        const oldProductID = lineItem.ProductID;
        const oldLotNumber = lineItem.LotNumber;
        const oldIsBreakBulk = lineItem.IsBreakBulk;

        const currentProductID = newProductID || oldProductID;
        const currentLotNumber = newLotNumber || oldLotNumber;
        const currentIsBreakBulk = newIsBreakBulk !== undefined ? newIsBreakBulk : oldIsBreakBulk;

        const productLot = await findOrCreateProductLot(transaction, currentProductID, currentLotNumber, newExpirationDate, currentIsBreakBulk);
        const newProductLotId = productLot ? productLot.ProductLotID : null;

        await ReceiptLineItem.update({
            ...updates,
            ReceivedQuantity: newReceivedQuantity !== undefined ? newReceivedQuantity : oldReceivedQuantity,
            LocationID: newLocationID || oldLocationID,
            ProductID: currentProductID,
            LotNumber: currentLotNumber,
            ExpirationDate: newExpirationDate || lineItem.ExpirationDate,
            IsBreakBulk: currentIsBreakBulk,
        }, {
            where: { ReceiptLineItemID: lineItemId },
            transaction,
        });

        // Adjust inventory if quantity, location, or break bulk status changed
        if (oldProductID) {
            const oldProductLot = await ProductLot.findOne({ where: { ProductID: oldProductID, LotNumber: oldLotNumber }, transaction });
            const oldProductLotId = oldProductLot ? oldProductLot.ProductLotID : null;

            // Decrement old inventory
            if (oldProductLotId && oldLocationID) {
                await updateInventoryWithTransaction(transaction, oldProductLotId, null, oldLocationID, -oldReceivedQuantity);
            } else if (oldIsBreakBulk && oldLocationID) {
                await updateInventoryWithTransaction(transaction, null, oldProductID, oldLocationID, -oldReceivedQuantity);
            }
        }

        if (currentProductID) {
            // Increment new inventory
            if (newProductLotId && (newLocationID || oldLocationID) && newReceivedQuantity !== undefined) {
                await updateInventoryWithTransaction(transaction, newProductLotId, null, newLocationID || oldLocationID, newReceivedQuantity);
            } else if (currentIsBreakBulk && (newLocationID || oldLocationID) && newReceivedQuantity !== undefined) {
                await updateInventoryWithTransaction(transaction, null, currentProductID, newLocationID || oldLocationID, newReceivedQuantity);
            }
        }

        await transaction.commit();
        const updatedLineItem = await ReceiptLineItem.findByPk(lineItemId);
        return res.status(200).json(updatedLineItem);

    } catch (error) {
        await transaction.rollback();
        handleErrors(res, error);
    }
};

// Delete a specific receipt line item (with inventory adjustment)
exports.deleteReceiptLineItem = async (req, res) => {
    const transaction = await req.sequelize.transaction();
    try {
        const { lineItemId } = req.params;
        const lineItem = await ReceiptLineItem.findByPk(lineItemId, { transaction });
        if (!lineItem) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Receipt Line Item not found.' });
        }

        // Adjust inventory before deleting
        if (!lineItem.IsBreakBulk && lineItem.LotNumber && lineItem.LocationID) {
            const productLot = await ProductLot.findOne({ where: { ProductID: lineItem.ProductID, LotNumber: lineItem.LotNumber }, transaction });
            if (productLot) {
                await updateInventoryWithTransaction(transaction, productLot.ProductLotID, null, lineItem.LocationID, -lineItem.ReceivedQuantity);
            }
        } else if (lineItem.IsBreakBulk && lineItem.LocationID) {
            await updateInventoryWithTransaction(transaction, null, lineItem.ProductID, lineItem.LocationID, -lineItem.ReceivedQuantity);
        }

        await ReceiptLineItem.destroy({ where: { ReceiptLineItemID: lineItemId }, transaction });

        await transaction.commit();
        return res.status(204).send();

    } catch (error) {
        await transaction.rollback();
        handleErrors(res, error);
    }
};

// Get all line items for a specific receipt
// Validation middleware already defined above (getAllReceiptLineItemsValidation)
exports.getAllReceiptLineItems = async (req, res) => {
    try {
        const { receiptId } = req.params;
        const receipt = await Receipt.findByPk(receiptId);
        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found.' });
        }
        const lineItems = await ReceiptLineItem.findAll({
            where: { ReceiptID: receiptId },
        });
        return res.status(200).json(lineItems);
    } catch (error) {
        handleErrors(res, error);
    }
};
