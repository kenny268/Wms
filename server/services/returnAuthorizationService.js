const { ReturnAuthorization, ReturnAuthorizationLineItem, OutboundOrder, OutboundOrderLineItem, Receipt, ReceiptLineItem, Inventory, Product, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const logger = require('../utils/logger');

const returnAuthorizationService = {
    async createReturnAuthorization(returnAuthData) {
        const transaction = await sequelize.transaction();
        try {
            const { returnAuthorizationLineItems, ...returnAuthDetails } = returnAuthData;

            // Check if Outbound Order exists
            const outboundOrder = await OutboundOrder.findByPk(returnAuthDetails.OutboundOrderID, { transaction });
            if (!outboundOrder) {
                throw new Error(`Outbound order with ID ${returnAuthDetails.OutboundOrderID} not found.`);
            }

            const returnAuthorization = await ReturnAuthorization.create(returnAuthDetails, { transaction });

            if (returnAuthorizationLineItems && returnAuthorizationLineItems.length > 0) {
                for (const item of returnAuthorizationLineItems) {
                    const outboundOrderLineItem = await OutboundOrderLineItem.findByPk(item.OutboundOrderLineItemID, { transaction });
                    if (!outboundOrderLineItem) {
                        throw new Error(`Outbound order line item with ID ${item.OutboundOrderLineItemID} not found.`);
                    }

                    if (item.QuantityReturned > outboundOrderLineItem.QuantityOrdered) {
                        throw new Error(`Quantity returned for Outbound Order Line Item ID ${item.OutboundOrderLineItemID} exceeds the quantity ordered.`);
                    }

                    await ReturnAuthorizationLineItem.create({
                        RMAID: returnAuthorization.RMAID,
                        OrderItemID: item.OutboundOrderLineItemID,
                        ProductID: outboundOrderLineItem.ProductID,
                        QuantityReturned: item.QuantityReturned,
                        ReasonForReturn: item.ReasonForReturn,
                    }, { transaction });
                }
            }

            await transaction.commit();
            logger.info(`Return authorization created with ID: ${returnAuthorization.RMAID}, linked to Order ID: ${returnAuthorization.OutboundOrderID}`);
            return await ReturnAuthorization.findByPk(returnAuthorization.RMAID, { include: [ReturnAuthorizationLineItem] });
        } catch (error) {
            await transaction.rollback();
            logger.error(`Error creating return authorization: ${error.message}`, { returnAuthData });
            throw error;
        }
    },

    async getAllReturnAuthorizations(filters, pagination) {
        try {
            const { outboundOrderId, returnAuthorizationStatus, startDate, endDate } = filters;
            const { page, limit } = pagination;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};

            if (outboundOrderId) where.OrderID = parseInt(outboundOrderId);
            if (returnAuthorizationStatus) where.ReturnStatus = returnAuthorizationStatus;
            if (startDate && endDate) where.ReturnDate = { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) };
            else if (startDate) where.ReturnDate = { [Op.gte]: new Date(startDate) };
            else if (endDate) where.ReturnDate = { [Op.lte]: new Date(endDate) };

            const { count, rows } = await ReturnAuthorization.findAndCountAll({
                where,
                include: [
                    { model: OutboundOrder },
                    { model: User, as: 'RequestedByUser' },
                ],
                offset,
                limit,
                order: [['ReturnDate', 'DESC']],
            });

            return { count, rows };
        } catch (error) {
            logger.error(`Error retrieving return authorizations: ${error.message}`, { filters, pagination });
            throw error;
        }
    },

    async getReturnAuthorizationById(id) {
        try {
            const returnAuthorization = await ReturnAuthorization.findByPk(id, {
                include: [
                    { model: ReturnAuthorizationLineItem, include: [Product, { model: OutboundOrderLineItem }] },
                    { model: OutboundOrder },
                    { model: User, as: 'RequestedByUser' },
                    { model: User, as: 'ApprovedByUser' },
                ],
            });
            return returnAuthorization;
        } catch (error) {
            logger.error(`Error retrieving return authorization with ID ${id}: ${error.message}`);
            throw error;
        }
    },

    async updateReturnAuthorization(id, updateData) {
        try {
            const [updatedRows] = await ReturnAuthorization.update(updateData, {
                where: { RMAID: id },
            });
            if (updatedRows > 0) {
                logger.info(`Return authorization with ID ${id} updated.`);
                return await ReturnAuthorization.findByPk(id);
            }
            return null; // Return authorization not found
        } catch (error) {
            logger.error(`Error updating return authorization with ID ${id}: ${error.message}`, { updateData });
            throw error;
        }
    },

    async deleteReturnAuthorization(id) {
        const transaction = await sequelize.transaction();
        try {
            const returnAuthorization = await ReturnAuthorization.findByPk(id, { transaction });
            if (!returnAuthorization) {
                return false; // Return authorization not found
            }

            // Optionally delete associated return authorization line items
            await ReturnAuthorizationLineItem.destroy({ where: { RMAID: id }, transaction });
            await returnAuthorization.destroy({ transaction });

            await transaction.commit();
            logger.info(`Return authorization with ID ${id} deleted.`);
            return true;
        } catch (error) {
            await transaction.rollback();
            logger.error(`Error deleting return authorization with ID ${id}: ${error.message}`);
            throw error;
        }
    },

    async addLineItemToReturnAuthorization(returnAuthorizationId, lineItemData) {
        try {
            const returnAuthorization = await ReturnAuthorization.findByPk(returnAuthorizationId);
            if (!returnAuthorization) {
                throw new Error(`Return authorization with ID ${returnAuthorizationId} not found.`);
            }

            const outboundOrderLineItem = await OutboundOrderLineItem.findByPk(lineItemData.OutboundOrderLineItemID);
            if (!outboundOrderLineItem) {
                throw new Error(`Outbound order line item with ID ${lineItemData.OutboundOrderLineItemID} not found.`);
            }

            // Ideally, check if the quantity returned does not exceed the original quantity ordered
            const existingReturnLineItems = await ReturnAuthorizationLineItem.findAll({
                where: {
                    RMAID: returnAuthorizationId,
                    OrderItemID: lineItemData.OutboundOrderLineItemID,
                },
            });
            const alreadyReturnedQuantity = existingReturnLineItems.reduce((sum, item) => sum + item.QuantityReturned, 0);

            if (lineItemData.QuantityReturned + alreadyReturnedQuantity > outboundOrderLineItem.QuantityOrdered) {
                throw new Error(`Total quantity returned for Outbound Order Line Item ID ${lineItemData.OutboundOrderLineItemID} exceeds the quantity ordered.`);
            }

            const newReturnAuthorizationLineItem = await ReturnAuthorizationLineItem.create({
                RMAID: returnAuthorizationId,
                OrderItemID: lineItemData.OutboundOrderLineItemID,
                ProductID: outboundOrderLineItem.ProductID,
                QuantityReturned: lineItemData.QuantityReturned,
                ReasonForReturn: lineItemData.ReasonForReturn,
            });

            logger.info(`Line item added to return authorization ${returnAuthorizationId}, Line Item ID: ${newReturnAuthorizationLineItem.RMALineItemID}`);
            return newReturnAuthorizationLineItem;
        } catch (error) {
            logger.error(`Error adding line item to return authorization ${returnAuthorizationId}: ${error.message}`, { lineItemData });
            throw error;
        }
    },

    async getAllReturnAuthorizationLineItems(returnAuthorizationId) {
        try {
            const lineItems = await ReturnAuthorizationLineItem.findAll({
                where: { RMAID: returnAuthorizationId },
                include: [Product, { model: OutboundOrderLineItem }],
            });
            return lineItems;
        } catch (error) {
            logger.error(`Error retrieving line items for return authorization ${returnAuthorizationId}: ${error.message}`);
            throw error;
        }
    },

    async getReturnAuthorizationLineItemById(lineItemId) {
        try {
            const lineItem = await ReturnAuthorizationLineItem.findByPk(lineItemId, { include: [Product, { model: OutboundOrderLineItem }] });
            return lineItem;
        } catch (error) {
            logger.error(`Error retrieving return authorization line item with ID ${lineItemId}: ${error.message}`);
            throw error;
        }
    },

    async updateReturnAuthorizationLineItem(lineItemId, updateData) {
        try {
            const returnAuthorizationLineItem = await ReturnAuthorizationLineItem.findByPk(lineItemId);
            if (!returnAuthorizationLineItem) {
                return null; // Return authorization line item not found
            }

            const outboundOrderLineItem = await OutboundOrderLineItem.findByPk(returnAuthorizationLineItem.OrderItemID);
            if (!outboundOrderLineItem) {
                throw new Error(`Outbound order line item with ID ${returnAuthorizationLineItem.OrderItemID} not found.`);
            }

            if (updateData.QuantityReturned !== undefined) {
                const currentRMA = await ReturnAuthorization.findByPk(returnAuthorizationLineItem.RMAID);
                const existingReturnLineItems = await ReturnAuthorizationLineItem.findAll({
                    where: {
                        RMAID: currentRMA.RMAID,
                        OrderItemID: returnAuthorizationLineItem.OrderItemID,
                        RMALineItemID: { [Op.ne]: lineItemId } // Exclude the current item being updated
                    },
                });
                const alreadyReturnedQuantity = existingReturnLineItems.reduce((sum, item) => sum + item.QuantityReturned, 0);

                if (parseInt(updateData.QuantityReturned) + alreadyReturnedQuantity > outboundOrderLineItem.QuantityOrdered) {
                    throw new Error(`Total quantity returned for Outbound Order Line Item ID ${returnAuthorizationLineItem.OrderItemID} exceeds the quantity ordered.`);
                }
            }

            const [updatedRows] = await ReturnAuthorizationLineItem.update(updateData, {
                where: { RMALineItemID: lineItemId },
            });
            if (updatedRows > 0) {
                logger.info(`Return authorization line item with ID ${lineItemId} updated.`);
                return await ReturnAuthorizationLineItem.findByPk(lineItemId);
            }
            return null;
        } catch (error) {
            logger.error(`Error updating return authorization line item with ID ${lineItemId}: ${error.message}`, { updateData });
            throw error;
        }
    },

    async deleteReturnAuthorizationLineItem(lineItemId) {
        try {
            const deletedRows = await ReturnAuthorizationLineItem.destroy({
                where: { RMALineItemID: lineItemId },
            });
            if (deletedRows > 0) {
                logger.info(`Return authorization line item with ID ${lineItemId} deleted.`);
                return true;
            }
            return false;
        } catch (error) {
            logger.error(`Error deleting return authorization line item with ID ${lineItemId}: ${error.message}`);
            throw error;
        }
    },

    async receiveReturnedItems(returnAuthorizationId, receiveData) {
        const transaction = await sequelize.transaction();
        try {
            const returnAuthorization = await ReturnAuthorization.findByPk(returnAuthorizationId, {
                include: [ReturnAuthorizationLineItem],
                transaction,
            });
            if (!returnAuthorization) {
                throw new Error(`Return authorization with ID ${returnAuthorizationId} not found.`);
            }

            if (returnAuthorization.ReturnStatus !== 'Approved' && returnAuthorization.ReturnStatus !== 'Pending') {
                throw new Error(`Return authorization with ID ${returnAuthorizationId} is not in a state that allows receiving.`);
            }

            const receipt = await Receipt.create({
                ReceiptDate: new Date(), // Set receipt date to now or use a provided date
                ReceiverUserID: receiveData.ReceivedByUserID,
                Notes: `Receipt for Return Authorization ID: ${returnAuthorizationId}`,
            }, { transaction });

            for (const item of receiveData.receiptLineItems) {
                const returnAuthorizationLineItem = await ReturnAuthorizationLineItem.findByPk(item.ReturnAuthorizationLineItemID, { transaction });
                if (!returnAuthorizationLineItem) {
                    throw new Error(`Return authorization line item with ID ${item.ReturnAuthorizationLineItemID} not found.`);
                }

                if (item.QuantityReceived > returnAuthorizationLineItem.QuantityReturned) {
                    throw new Error(`Quantity received for Return Authorization Line Item ID ${item.ReturnAuthorizationLineItemID} exceeds the quantity authorized for return.`);
                }

                const product = await Product.findByPk(returnAuthorizationLineItem.ProductID, { transaction });
                if (!product) {
                    throw new Error(`Product with ID ${returnAuthorizationLineItem.ProductID} not found.`);
                }

                // Assuming you have a way to identify the specific inventory item (e.g., by ProductID and ReceivingLocationID)
                // You might need to adjust this based on your inventory model (e.g., handling lot numbers or serial numbers)
                let inventory = await Inventory.findOne({
                    where: {
                        ProductID: returnAuthorizationLineItem.ProductID,
                        LocationID: item.ReceivingLocationID,
                    },
                    transaction,
                });

                if (!inventory) {
                    inventory = await Inventory.create({
                        ProductID: returnAuthorizationLineItem.ProductID,
                        LocationID: item.ReceivingLocationID,
                        QuantityOnHand: 0,
                        QuantityAllocated: 0,
                    }, { transaction });
                }

                await ReceiptLineItem.create({
                    ReceiptID: receipt.ReceiptID,
                    ProductID: returnAuthorizationLineItem.ProductID,
                    ExpectedQuantity: returnAuthorizationLineItem.QuantityReturned, // Or item.QuantityReceived?
                    ReceivedQuantity: item.QuantityReceived,
                    // You might need to determine UnitOfMeasure based on the product or order
                    UnitOfMeasure: 'Units', // Placeholder
                    ReturnAuthorizationLineItemID: item.ReturnAuthorizationLineItemID,
                }, { transaction });

                // Update inventory
                await inventory.update({
                    QuantityOnHand: inventory.QuantityOnHand + item.QuantityReceived,
                }, { transaction });

                // Optionally update ReturnAuthorizationLineItem status
                await returnAuthorizationLineItem.update({
                    ConditionOnReturn: item.ConditionOnReturn || null, // Capture condition if provided
                }, { transaction });
            }

            // Update ReturnAuthorization status to 'Received' or 'Closed' based on your business logic
            const allItemsReceived = returnAuthorization.ReturnAuthorizationLineItems.every(
                (rali) => receiveData.receiptLineItems.some(
                    (rli) => rli.ReturnAuthorizationLineItemID === rali.RMALineItemID && rli.QuantityReceived === rali.QuantityReturned
                )
            );

            await returnAuthorization.update({
                ReturnStatus: allItemsReceived ? 'Closed' : 'Received',
            }, { transaction });

            await transaction.commit();
            logger.info(`Returned items received for Return Authorization ID: ${returnAuthorizationId}, Receipt ID: ${receipt.ReceiptID}`);
            return await Receipt.findByPk(receipt.ReceiptID, { include: [ReceiptLineItem] });
        } catch (error) {
            await transaction.rollback();
            logger.error(`Error receiving returned items for Return Authorization ID ${returnAuthorizationId}: ${error.message}`, { receiveData });
            if (error.message.includes('not found') || error.message.includes('exceeds') || error.message.includes('state that allows receiving')) {
                return { status: 400, message: error.message };
            }
            return { status: 500, message: error.message || 'Internal Server Error' };
        }
    },
};

module.exports = returnAuthorizationService;