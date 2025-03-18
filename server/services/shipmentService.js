const { Shipment, ShipmentLineItem, OutboundOrder, OutboundOrderLineItem, Inventory, Product, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db');
const logger = require('../utils/logger');

const shipmentService = {
    async createShipment(shipmentData) {
        const transaction = await sequelize.transaction();
        try {
            const { shipmentLineItems, ...shipmentDetails } = shipmentData;

            // Check if Outbound Order exists
            const outboundOrder = await OutboundOrder.findByPk(shipmentDetails.OutboundOrderID, { transaction });
            if (!outboundOrder) {
                throw new Error(`Outbound order with ID ${shipmentDetails.OutboundOrderID} not found.`);
            }

            const shipmentNumber = `SHIP-${Date.now()}`; // Generate a simple shipment number
            const shipment = await Shipment.create({ ...shipmentDetails, ShipmentNumber: shipmentNumber }, { transaction });

            if (shipmentLineItems && shipmentLineItems.length > 0) {
                for (const item of shipmentLineItems) {
                    const outboundOrderLineItem = await OutboundOrderLineItem.findByPk(item.OutboundOrderLineItemID, { transaction });
                    if (!outboundOrderLineItem) {
                        throw new Error(`Outbound order line item with ID ${item.OutboundOrderLineItemID} not found.`);
                    }

                    if (item.QuantityShipped > outboundOrderLineItem.QuantityOrdered) {
                        throw new Error(`Quantity shipped for Outbound Order Line Item ID ${item.OutboundOrderLineItemID} exceeds the quantity ordered.`);
                    }

                    // Ideally, check against allocated quantity in inventory as well
                    // const inventory = await Inventory.findOne({ where: { ProductID: outboundOrderLineItem.ProductID }, transaction });
                    // if (inventory && item.QuantityShipped > inventory.QuantityAllocated) {
                    //     throw new Error(`Quantity shipped for Product ID ${outboundOrderLineItem.ProductID} exceeds the allocated quantity.`);
                    // }

                    await ShipmentLineItem.create({
                        ShipmentID: shipment.ShipmentID,
                        OrderItemID: item.OutboundOrderLineItemID,
                        ProductID: outboundOrderLineItem.ProductID,
                        QuantityShipped: item.QuantityShipped,
                    }, { transaction });

                    // Update OutboundOrderLineItem's QuantityShipped
                    await outboundOrderLineItem.update({
                        QuantityShipped: outboundOrderLineItem.QuantityShipped + item.QuantityShipped
                    }, { transaction });

                    // Consider updating Inventory (decrement QuantityAllocated and QuantityOnHand)
                    // This might be part of a separate fulfillment process or triggered here based on your logic
                }
            }

            await transaction.commit();
            logger.info(`Shipment created with ID: ${shipment.ShipmentID}, linked to Order ID: ${shipment.OutboundOrderID}`);
            return await Shipment.findByPk(shipment.ShipmentID, { include: [ShipmentLineItem] });
        } catch (error) {
            await transaction.rollback();
            logger.error(`Error creating shipment: ${error.message}`, { shipmentData });
            throw error;
        }
    },

    async getAllShipments(filters, pagination) {
        try {
            const { outboundOrderId, shipmentStatus, startDate, endDate } = filters;
            const { page, limit } = pagination;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};

            if (outboundOrderId) where.OrderID = parseInt(outboundOrderId);
            if (shipmentStatus) where.ShipmentStatus = shipmentStatus;
            if (startDate && endDate) where.ShipmentDate = { [Op.gte]: new Date(startDate), [Op.lte]: new Date(endDate) };
            else if (startDate) where.ShipmentDate = { [Op.gte]: new Date(startDate) };
            else if (endDate) where.ShipmentDate = { [Op.lte]: new Date(endDate) };

            const { count, rows } = await Shipment.findAndCountAll({
                where,
                include: [
                    { model: OutboundOrder },
                    { model: User, as: 'ShippedByUser' },
                ],
                offset,
                limit,
                order: [['ShipmentDate', 'DESC']],
            });

            return { count, rows };
        } catch (error) {
            logger.error(`Error retrieving shipments: ${error.message}`, { filters, pagination });
            throw error;
        }
    },

    async getShipmentById(id) {
        try {
            const shipment = await Shipment.findByPk(id, {
                include: [
                    { model: ShipmentLineItem, include: [Product, { model: OutboundOrderLineItem }] },
                    { model: OutboundOrder },
                    { model: User, as: 'ShippedByUser' },
                ],
            });
            return shipment;
        } catch (error) {
            logger.error(`Error retrieving shipment with ID ${id}: ${error.message}`);
            throw error;
        }
    },

    async updateShipment(id, updateData) {
        try {
            const [updatedRows] = await Shipment.update(updateData, {
                where: { ShipmentID: id },
            });
            if (updatedRows > 0) {
                logger.info(`Shipment with ID ${id} updated.`);
                return await Shipment.findByPk(id);
            }
            return null; // Shipment not found
        } catch (error) {
            logger.error(`Error updating shipment with ID ${id}: ${error.message}`, { updateData });
            throw error;
        }
    },

    async deleteShipment(id) {
        const transaction = await sequelize.transaction();
        try {
            const shipment = await Shipment.findByPk(id, { transaction });
            if (!shipment) {
                return false; // Shipment not found
            }

            // Optionally delete associated shipment line items
            await ShipmentLineItem.destroy({ where: { ShipmentID: id }, transaction });
            await shipment.destroy({ transaction });

            await transaction.commit();
            logger.info(`Shipment with ID ${id} deleted.`);
            return true;
        } catch (error) {
            await transaction.rollback();
            logger.error(`Error deleting shipment with ID ${id}: ${error.message}`);
            throw error;
        }
    },

    async addLineItemToShipment(shipmentId, lineItemData) {
        try {
            const shipment = await Shipment.findByPk(shipmentId);
            if (!shipment) {
                throw new Error(`Shipment with ID ${shipmentId} not found.`);
            }

            const outboundOrderLineItem = await OutboundOrderLineItem.findByPk(lineItemData.OutboundOrderLineItemID);
            if (!outboundOrderLineItem) {
                throw new Error(`Outbound order line item with ID ${lineItemData.OutboundOrderLineItemID} not found.`);
            }

            if (lineItemData.QuantityShipped > outboundOrderLineItem.QuantityOrdered - outboundOrderLineItem.QuantityShipped) {
                throw new Error(`Quantity shipped exceeds the remaining quantity to be shipped for Outbound Order Line Item ID ${lineItemData.OutboundOrderLineItemID}.`);
            }

            const newShipmentLineItem = await ShipmentLineItem.create({
                ShipmentID: shipmentId,
                OrderItemID: lineItemData.OutboundOrderLineItemID,
                ProductID: outboundOrderLineItem.ProductID,
                QuantityShipped: lineItemData.QuantityShipped,
            });

            // Update OutboundOrderLineItem's QuantityShipped
            await outboundOrderLineItem.update({
                QuantityShipped: outboundOrderLineItem.QuantityShipped + lineItemData.QuantityShipped
            });

            logger.info(`Line item added to shipment ${shipmentId}, Line Item ID: ${newShipmentLineItem.ShipmentLineItemID}`);
            return newShipmentLineItem;
        } catch (error) {
            logger.error(`Error adding line item to shipment ${shipmentId}: ${error.message}`, { lineItemData });
            throw error;
        }
    },

    async getAllShipmentLineItems(shipmentId) {
        try {
            const lineItems = await ShipmentLineItem.findAll({
                where: { ShipmentID: shipmentId },
                include: [Product, { model: OutboundOrderLineItem }],
            });
            return lineItems;
        } catch (error) {
            logger.error(`Error retrieving line items for shipment ${shipmentId}: ${error.message}`);
            throw error;
        }
    },

    async getShipmentLineItemById(lineItemId) {
        try {
            const lineItem = await ShipmentLineItem.findByPk(lineItemId, { include: [Product, { model: OutboundOrderLineItem }] });
            return lineItem;
        } catch (error) {
            logger.error(`Error retrieving shipment line item with ID ${lineItemId}: ${error.message}`);
            throw error;
        }
    },

    async updateShipmentLineItem(lineItemId, updateData) {
        try {
            const shipmentLineItem = await ShipmentLineItem.findByPk(lineItemId);
            if (!shipmentLineItem) {
                return null; // Shipment line item not found
            }

            const outboundOrderLineItem = await OutboundOrderLineItem.findByPk(shipmentLineItem.OrderItemID);
            if (!outboundOrderLineItem) {
                throw new Error(`Outbound order line item with ID ${shipmentLineItem.OrderItemID} not found.`);
            }

            let newQuantityShipped = updateData.QuantityShipped !== undefined ? parseInt(updateData.QuantityShipped) : shipmentLineItem.QuantityShipped;
            const originalQuantityShipped = shipmentLineItem.QuantityShipped;
            const alreadyShippedOnOrder = outboundOrderLineItem.QuantityShipped;
            const quantityOrdered = outboundOrderLineItem.QuantityOrdered;

            const totalShippedAfterUpdate = alreadyShippedOnOrder - originalQuantityShipped + newQuantityShipped;

            if (totalShippedAfterUpdate > quantityOrdered) {
                throw new Error(`Updated quantity shipped exceeds the total quantity ordered for the associated outbound order line item.`);
            }

            const [updatedRows] = await ShipmentLineItem.update(updateData, {
                where: { ShipmentLineItemID: lineItemId },
            });

            if (updatedRows > 0 && updateData.QuantityShipped !== undefined) {
                // Recalculate and update OutboundOrderLineItem's QuantityShipped
                const shipmentLineItemsForOrderItem = await ShipmentLineItem.findAll({
                    where: { OrderItemID: outboundOrderLineItem.OrderItemID }
                });
                const totalShipped = shipmentLineItemsForOrderItem.reduce((sum, item) => sum + item.QuantityShipped, 0);
                await outboundOrderLineItem.update({ QuantityShipped: totalShipped });
            }

            if (updatedRows > 0) {
                logger.info(`Shipment line item with ID ${lineItemId} updated.`);
                return await ShipmentLineItem.findByPk(lineItemId);
            }
            return null;
        } catch (error) {
            logger.error(`Error updating shipment line item with ID ${lineItemId}: ${error.message}`, { updateData });
            throw error;
        }
    },

    async deleteShipmentLineItem(lineItemId) {
        const transaction = await sequelize.transaction();
        try {
            const shipmentLineItem = await ShipmentLineItem.findByPk(lineItemId, { transaction });
            if (!shipmentLineItem) {
                return false; // Shipment line item not found
            }

            const outboundOrderLineItem = await OutboundOrderLineItem.findByPk(shipmentLineItem.OrderItemID, { transaction });
            if (outboundOrderLineItem) {
                await outboundOrderLineItem.update({
                    QuantityShipped: outboundOrderLineItem.QuantityShipped - shipmentLineItem.QuantityShipped
                }, { transaction });
            }

            const deletedRows = await ShipmentLineItem.destroy({
                where: { ShipmentLineItemID: lineItemId },
                transaction
            });

            await transaction.commit();

            if (deletedRows > 0) {
                logger.info(`Shipment line item with ID ${lineItemId} deleted.`);
                return true;
            }
            return false;
        } catch (error) {
            await transaction.rollback();
            logger.error(`Error deleting shipment line item with ID ${lineItemId}: ${error.message}`);
            throw error;
        }
    },
};

module.exports = shipmentService;