const { OutboundOrder, OutboundOrderLineItem, Product, User, Address, Inventory } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const logger = require('../utils/logger');

const outboundOrderService = {
    async createOutboundOrder(orderData) {
        const transaction = await sequelize.transaction();
        try {
            const { lineItems, ...orderDetails } = orderData;
            const outboundOrder = await OutboundOrder.create(orderDetails, { transaction });

            if (lineItems && lineItems.length > 0) {
                const lineItemsToCreate = lineItems.map(item => ({
                    ...item,
                    OrderID: outboundOrder.OrderID,
                }));
                await OutboundOrderLineItem.bulkCreate(lineItemsToCreate, { transaction });
            }

            await transaction.commit();
            logger.info(`Outbound order created with ID: ${outboundOrder.OrderID}, Order Number: ${outboundOrder.OrderNumber}`);
            return await OutboundOrder.findByPk(outboundOrder.OrderID, { include: [OutboundOrderLineItem] });
        } catch (error) {
            await transaction.rollback();
            logger.error(`Error creating outbound order: ${error.message}`, { orderData });
            throw error;
        }
    },

    async getAllOutboundOrders(filters, pagination) {
        try {
            const { customerId, orderStatus, startDate, endDate } = filters;
            const { page, limit } = pagination;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};

            if (customerId) where.CustomerID = parseInt(customerId);
            if (orderStatus) where.OrderStatus = orderStatus;
            if (startDate && endDate) where.OrderDate = { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) };
            else if (startDate) where.OrderDate = { [Op.gte]: new Date(startDate) };
            else if (endDate) where.OrderDate = { [Op.lte]: new Date(endDate) };

            const { count, rows } = await OutboundOrder.findAndCountAll({
                where,
                include: [
                    { model: User, as: 'OrderCreatedByUser' },
                    { model: Address, as: 'ShippingAddress' },
                    { model: Address, as: 'BillingAddress' },
                    // Assuming a Customer model exists and is associated
                    // { model: Customer, as: 'Customer' },
                ],
                offset,
                limit,
                order: [['OrderDate', 'DESC']],
            });

            return { count, rows };
        } catch (error) {
            logger.error(`Error retrieving outbound orders: ${error.message}`, { filters, pagination });
            throw error;
        }
    },

    async getOutboundOrderById(id) {
        try {
            const outboundOrder = await OutboundOrder.findByPk(id, {
                include: [
                    { model: OutboundOrderLineItem, include: [Product] },
                    { model: User, as: 'OrderCreatedByUser' },
                    { model: Address, as: 'ShippingAddress' },
                    { model: Address, as: 'BillingAddress' },
                    // Assuming a Customer model exists and is associated
                    // { model: Customer, as: 'Customer' },
                ],
            });
            return outboundOrder;
        } catch (error) {
            logger.error(`Error retrieving outbound order with ID ${id}: ${error.message}`);
            throw error;
        }
    },

    async updateOutboundOrder(id, updateData) {
        try {
            const [updatedRows] = await OutboundOrder.update(updateData, {
                where: { OrderID: id },
            });
            if (updatedRows > 0) {
                logger.info(`Outbound order with ID ${id} updated.`);
                return await OutboundOrder.findByPk(id);
            }
            return null; // Order not found
        } catch (error) {
            logger.error(`Error updating outbound order with ID ${id}: ${error.message}`, { updateData });
            throw error;
        }
    },

    async deleteOutboundOrder(id) {
        const transaction = await sequelize.transaction();
        try {
            const outboundOrder = await OutboundOrder.findByPk(id, { transaction });
            if (!outboundOrder) {
                return false; // Order not found
            }

            // Optionally delete associated line items
            await OutboundOrderLineItem.destroy({ where: { OrderID: id }, transaction });
            await outboundOrder.destroy({ transaction });

            await transaction.commit();
            logger.info(`Outbound order with ID ${id} deleted.`);
            return true;
        } catch (error) {
            await transaction.rollback();
            logger.error(`Error deleting outbound order with ID ${id}: ${error.message}`);
            throw error;
        }
    },

    async addLineItemToOutboundOrder(orderId, lineItemData) {
        try {
            const outboundOrder = await OutboundOrder.findByPk(orderId);
            if (!outboundOrder) {
                throw new Error(`Outbound order with ID ${orderId} not found.`);
            }
            const newLineItem = await OutboundOrderLineItem.create({
                ...lineItemData,
                OrderID: orderId,
            });
            logger.info(`Line item added to order ${orderId}, Line Item ID: ${newLineItem.OrderItemID}`);
            return newLineItem;
        } catch (error) {
            logger.error(`Error adding line item to order ${orderId}: ${error.message}`, { lineItemData });
            throw error;
        }
    },

    async getAllOutboundOrderLineItems(orderId) {
        try {
            const lineItems = await OutboundOrderLineItem.findAll({
                where: { OrderID: orderId },
                include: [Product],
            });
            return lineItems;
        } catch (error) {
            logger.error(`Error retrieving line items for order ${orderId}: ${error.message}`);
            throw error;
        }
    },

    async getOutboundOrderLineItemById(lineItemId) {
        try {
            const lineItem = await OutboundOrderLineItem.findByPk(lineItemId, { include: [Product] });
            return lineItem;
        } catch (error) {
            logger.error(`Error retrieving line item with ID ${lineItemId}: ${error.message}`);
            throw error;
        }
    },

    async updateOutboundOrderLineItem(lineItemId, updateData) {
        try {
            const [updatedRows] = await OutboundOrderLineItem.update(updateData, {
                where: { OrderItemID: lineItemId },
            });
            if (updatedRows > 0) {
                logger.info(`Outbound order line item with ID ${lineItemId} updated.`);
                return await OutboundOrderLineItem.findByPk(lineItemId);
            }
            return null; // Line item not found
        } catch (error) {
            logger.error(`Error updating outbound order line item with ID ${lineItemId}: ${error.message}`, { updateData });
            throw error;
        }
    },

    async deleteOutboundOrderLineItem(lineItemId) {
        try {
            const deletedRows = await OutboundOrderLineItem.destroy({
                where: { OrderItemID: lineItemId },
            });
            if (deletedRows > 0) {
                logger.info(`Outbound order line item with ID ${lineItemId} deleted.`);
                return true;
            }
            return false; // Line item not found
        } catch (error) {
            logger.error(`Error deleting outbound order line item with ID ${lineItemId}: ${error.message}`);
            throw error;
        }
    },

    async allocateInventoryToOrder(orderId) {
        const transaction = await sequelize.transaction();
        try {
            const outboundOrder = await OutboundOrder.findByPk(orderId, {
                include: [{ model: OutboundOrderLineItem, include: [Product] }],
                transaction,
            });

            if (!outboundOrder) {
                throw new Error(`Outbound order with ID ${orderId} not found.`);
            }

            if (!outboundOrder.OutboundOrderLineItems || outboundOrder.OutboundOrderLineItems.length === 0) {
                throw new Error(`Outbound order with ID ${orderId} has no line items to allocate.`);
            }

            let allAllocated = true;
            for (const lineItem of outboundOrder.OutboundOrderLineItems) {
                const { ProductID, QuantityOrdered } = lineItem;

                const availableInventory = await Inventory.findAll({
                    where: { ProductID, QuantityOnHand: { [Op.gt]: 0 }, QuantityAllocated: { [Op.lt]: sequelize.literal('QuantityOnHand') } },
                    order: [['SystemTimestamp', 'ASC']], // FIFO might be a common strategy
                    transaction,
                });

                let quantityToAllocate = QuantityOrdered;
                for (const inventoryRecord of availableInventory) {
                    const canAllocate = Math.min(quantityToAllocate, inventoryRecord.QuantityOnHand - inventoryRecord.QuantityAllocated);
                    if (canAllocate > 0) {
                        await inventoryRecord.update({ QuantityAllocated: inventoryRecord.QuantityAllocated + canAllocate }, { transaction });
                        quantityToAllocate -= canAllocate;
                    }
                    if (quantityToAllocate === 0) {
                        break;
                    }
                }

                if (quantityToAllocate > 0) {
                    allAllocated = false;
                    logger.warn(`Insufficient inventory for Product ID ${ProductID} in order ${orderId}. Remaining quantity: ${quantityToAllocate}`);
                    // Decide if you want to throw an error or just log a warning and potentially update order status
                    // throw new Error(`Insufficient inventory for Product ID ${ProductID} in order ${orderId}.`);
                }
            }

            const newOrderStatus = allAllocated ? 'Processing' : 'Partially Allocated';
            await outboundOrder.update({ OrderStatus: newOrderStatus }, { transaction });

            await transaction.commit();
            logger.info(`Inventory allocation attempted for order ${orderId}. Status: ${newOrderStatus}`);
            return { message: `Inventory allocation completed for order ${orderId}. Status: ${newOrderStatus}` };

        } catch (error) {
            await transaction.rollback();
            logger.error(`Error allocating inventory for order ${orderId}: ${error.message}`);
            throw error;
        }
    },
};

module.exports = outboundOrderService;