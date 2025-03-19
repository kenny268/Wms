const { Receipt, ReceiptLineItem, Supplier, Product, UnitOfMeasure, Inventory, ProductLot, WarehouseLocation } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const sequelize = require('../config/db');

const receivingGoodsService = {
    async adjustInventoryQuantity({ productId, locationId, quantityChange, lotNumber, expirationDate, transaction }) {
        try {
            // Find or create the ProductLot
            const [productLot, createdLot] = await ProductLot.findOrCreate({
                where: { ProductID: productId, LotNumber: lotNumber },
                defaults: { ExpirationDate: expirationDate },
                transaction
            });

            // Find the existing inventory record
            const inventoryRecord = await Inventory.findOne({
                where: {
                    ProductLotID: productLot.ProductLotID,
                    LocationID: locationId,
                },
                transaction
            });

            if (inventoryRecord) {
                // Update the quantity
                await inventoryRecord.increment('QuantityOnHand', { by: quantityChange, transaction });
                logger.info(`Inventory for Product ${productId}, Lot ${lotNumber}, Location ${locationId} updated. Quantity increased by ${quantityChange}.`);
                return { status: 200, message: 'Inventory updated successfully.' };
            } else {
                // Create a new inventory record
                await Inventory.create({
                    ProductLotID: productLot.ProductLotID,
                    LocationID: locationId,
                    QuantityOnHand: quantityChange,
                }, { transaction });
                logger.info(`New inventory record created for Product ${productId}, Lot ${lotNumber}, Location ${locationId} with quantity ${quantityChange}.`);
                return { status: 201, message: 'New inventory record created.' };
            }
        } catch (error) {
            logger.error('Error adjusting inventory quantity:', error);
            return { status: 500, message: 'Failed to adjust inventory quantity.', error: error.message };
        }
    },

    async createReceipt(receiptData, userId) {
        try {
            const { SupplierID, ...otherFields } = receiptData;

            const supplier = await Supplier.findByPk(SupplierID);
            if (!supplier) {
                return { status: 404, message: `Supplier with ID ${SupplierID} not found.` };
            }

            const newReceipt = await Receipt.create({
                SupplierID,
                status: 'Draft',
                ReceiverUserID: userId,
                ...otherFields,
            });

            logger.info(`Draft receipt created with ID: ${newReceipt.ReceiptID} for Supplier ${SupplierID}`);
            return { status: 201, data: newReceipt };

        } catch (error) {
            logger.error('Error creating receipt:', error);
            return { status: 500, message: 'Failed to create receipt.', error: error.message };
        }
    },

    async addLineItemToReceipt(receiptId, lineItemData) {
        try {
            const { ProductID, UOMID, ...otherFields } = lineItemData;

            const receipt = await Receipt.findByPk(receiptId);
            if (!receipt) {
                return { status: 404, message: `Receipt with ID ${receiptId} not found.` };
            }

            if (receipt.status !== 'Draft') {
                return { status: 409, message: `Cannot add items to receipt with status: ${receipt.status}. Only 'Draft' receipts can be modified.` };
            }

            const product = await Product.findByPk(ProductID);
            if (!product) {
                return { status: 404, message: `Product with ID ${ProductID} not found.` };
            }

            const unitOfMeasure = await UnitOfMeasure.findByPk(UOMID);
            if (!unitOfMeasure) {
                return { status: 404, message: `Unit of Measure with ID ${UOMID} not found.` };
            }

            const newLineItem = await ReceiptLineItem.create({
                ReceiptID: parseInt(receiptId),
                ProductID,
                UOMID,
                ...otherFields,
            });

            logger.info(`Line item added to receipt ${receiptId} for Product ${ProductID}`);
            return { status: 201, data: newLineItem };

        } catch (error) {
            logger.error('Error adding line item to receipt:', error);
            return { status: 500, message: 'Failed to add line item.', error: error.message };
        }
    },

    async receiveReceipt(receiptId) {
        const transaction = await sequelize.transaction();
        try {
            const receipt = await Receipt.findByPk(receiptId, { include: ReceiptLineItem });

            if (!receipt) {
                await transaction.rollback();
                return { status: 404, message: `Receipt with ID ${receiptId} not found.` };
            }

            if (receipt.status !== 'Draft') {
                await transaction.rollback();
                return { status: 409, message: `Cannot receive receipt with status: ${receipt.status}. Only 'Draft' receipts can be received.` };
            }

            if (!receipt.ReceiptLineItems || receipt.ReceiptLineItems.length === 0) {
                await transaction.rollback();
                return { status: 400, message: 'Cannot receive a receipt with no line items.' };
            }

            // Update receipt status to "Received"
            await receipt.update({ status: 'Received' }, { transaction });
            logger.info(`Receipt ${receiptId} status updated to 'Received'.`);

            // Update inventory levels
            for (const lineItem of receipt.ReceiptLineItems) {
                const { ProductID, ReceivedQuantity, LotNumber, ExpirationDate } = lineItem;
                const defaultWarehouseLocationId = 1; // Replace with actual logic

                const adjustmentResult = await this.adjustInventoryQuantity({ // Calling the internal function
                    productId: ProductID,
                    locationId: defaultWarehouseLocationId,
                    quantityChange: ReceivedQuantity,
                    lotNumber: LotNumber,
                    expirationDate: ExpirationDate,
                    transaction // Pass the transaction
                });

                if (adjustmentResult.status !== 200) {
                    await transaction.rollback();
                    return { status: 500, message: `Error updating inventory for Product ${ProductID}: ${adjustmentResult.message}` };
                }
            }

            await transaction.commit();
            logger.info(`Receipt ${receiptId} received and inventory updated.`);
            return { status: 200, message: `Receipt ${receiptId} received successfully.` };

        } catch (error) {
            await transaction.rollback();
            logger.error('Error receiving receipt and updating inventory:', error);
            return { status: 500, message: 'Failed to receive receipt and update inventory.', error: error.message };
        }
    },

    async getAllReceipts(filters, pagination) {
        try {
            const { supplierId, receiptDate, referenceNumber, status } = filters;
            const { page = 1, limit = 10 } = pagination;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};

            if (supplierId) where.SupplierID = parseInt(supplierId);
            if (receiptDate) where.ReceiptDate = receiptDate;
            if (referenceNumber) where.ReferenceNumber = { [Op.iLike]: `%${referenceNumber}%` };
            if (status) where.status = status;

            const { count, rows } = await Receipt.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
                include: [{ model: Supplier, attributes: ['SupplierID', 'CompanyName'] }],
                order: [['ReceiptDate', 'DESC']],
            });

            return { status: 200, data: { count, rows } };

        } catch (error) {
            logger.error('Error retrieving receipts:', error);
            return { status: 500, message: 'Failed to retrieve receipts.', error: error.message };
        }
    },

    async getReceiptById(id) {
        try {
            const receipt = await Receipt.findByPk(id, {
                include: [
                    { model: Supplier, attributes: ['SupplierID', 'CompanyName'] },
                    {
                        model: ReceiptLineItem,
                        include: [
                            { model: Product, attributes: ['ProductID', 'ProductName', 'ProductCode'] },
                            { model: UnitOfMeasure, attributes: ['UOMID', 'UOMName', 'UOMCode'] },
                        ],
                    },
                ],
            });

            if (!receipt) {
                return { status: 404, message: `Receipt with ID ${id} not found.` };
            }

            return { status: 200, data: receipt };

        } catch (error) {
            logger.error('Error retrieving receipt by ID:', error);
            return { status: 500, message: 'Failed to retrieve receipt.', error: error.message };
        }
    },

    async updateReceipt(id, updateData) {
        try {
            const { SupplierID, ...otherUpdates } = updateData;

            const receipt = await Receipt.findByPk(id);
            if (!receipt) {
                return { status: 404, message: `Receipt with ID ${id} not found.` };
            }

            if (receipt.status !== 'Draft') {
                return { status: 409, message: `Cannot update receipt with status: ${receipt.status}. Only 'Draft' receipts can be updated.` };
            }

            if (SupplierID) {
                const supplier = await Supplier.findByPk(SupplierID);
                if (!supplier) {
                    return { status: 404, message: `Supplier with ID ${SupplierID} not found.` };
                }
            }

            await Receipt.update(otherUpdates, {
                where: { ReceiptID: id },
            });

            const updatedReceipt = await Receipt.findByPk(id);
            logger.info(`Receipt with ID ${id} updated.`);
            return { status: 200, data: updatedReceipt };

        } catch (error) {
            logger.error('Error updating receipt:', error);
            return { status: 500, message: 'Failed to update receipt.', error: error.message };
        }
    },

    async cancelReceipt(id) {
        try {
            const receipt = await Receipt.findByPk(id);

            if (!receipt) {
                return { status: 404, message: `Receipt with ID ${id} not found.` };
            }

            if (receipt.status !== 'Draft') {
                return { status: 409, message: `Cannot cancel receipt with status: ${receipt.status}. Only 'Draft' receipts can be cancelled.` };
            }

            await receipt.update({ status: 'Cancelled' });
            logger.info(`Receipt with ID ${id} cancelled.`);
            return { status: 200, message: `Receipt ${id} cancelled successfully.` };

        } catch (error) {
            logger.error('Error cancelling receipt:', error);
            return { status: 500, message: 'Failed to cancel receipt.', error: error.message };
        }
    },

    async deleteReceipt(id) {
        const transaction = await sequelize.transaction();
        try {
            const receipt = await Receipt.findByPk(id);

            if (!receipt) {
                await transaction.rollback();
                return { status: 404, message: `Receipt with ID ${id} not found.` };
            }

            if (receipt.status !== 'Draft') {
                await transaction.rollback();
                return { status: 409, message: `Cannot delete receipt with status: ${receipt.status}. Only 'Draft' receipts can be deleted.` };
            }

            // Delete associated line items
            await ReceiptLineItem.destroy({ where: { ReceiptID: id }, transaction });
            logger.info(`Line items for receipt ${id} deleted.`);

            // Delete the receipt
            await Receipt.destroy({ where: { ReceiptID: id }, transaction });
            logger.info(`Receipt with ID ${id} deleted.`);

            await transaction.commit();
            return { status: 204 };

        } catch (error) {
            await transaction.rollback();
            logger.error('Error deleting receipt:', error);
            return { status: 500, message: 'Failed to delete receipt.', error: error.message };
        }
    },
};

module.exports = receivingGoodsService;