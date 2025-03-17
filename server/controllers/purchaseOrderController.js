const { PurchaseOrder, PurchaseOrderLineItem, Supplier, User, Address, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { createOrUpdateAddress } = require('../utils/utils');
const { handleValidationErrors } = require('../utils/utils');

// Create a new Purchase Order
exports.createPurchaseOrder = async (req, res) => {
     const errors = handleValidationErrors(req, res);
     if (errors) return;
 
     const {
         PONumber,
         SupplierID,
         OrderDate,
         ExpectedDeliveryDate,
         ShippingAddress,
         BillingAddress,
         OrderCreatedByUserID,
         lineItems,
         Notes
     } = req.body;
 
     const transaction = await sequelize.transaction();
 
     try {
         const shippingAddressId = await createOrUpdateAddress(ShippingAddress, null, transaction);
         const billingAddressId = await createOrUpdateAddress(BillingAddress, null, transaction);
 
         const purchaseOrder = await PurchaseOrder.create({
             PONumber,
             SupplierID,
             OrderDate,
             ExpectedDeliveryDate,
             ShippingAddressID: shippingAddressId,
             BillingAddressID: billingAddressId,
             OrderCreatedByUserID,
             Notes
         }, { transaction });
 
         if (lineItems && lineItems.length > 0) {
             const lineItemsToCreate = lineItems.map(item => ({
                 ...item,
                 PurchaseOrderID: purchaseOrder.PurchaseOrderID
             }));
             await PurchaseOrderLineItem.bulkCreate(lineItemsToCreate, { transaction });
         }
 
         await transaction.commit();
 
         const poWithDetails = await PurchaseOrder.findByPk(purchaseOrder.PurchaseOrderID, {
             include: [PurchaseOrderLineItem, Supplier, { model: User, as: 'CreatedByUser' }, { model: Address, as: 'ShippingAddress' }, { model: Address, as: 'BillingAddress' }]
         });
         logger.info(`Purchase order created successfully with ID: ${purchaseOrder.PurchaseOrderID}`);
         res.status(201).json(poWithDetails);
 
     } catch (error) {
         await transaction.rollback();
         logger.error('Error creating purchase order:', error);
         res.status(500).json({ message: 'Failed to create purchase order', error: error.message });
     }
};

// Controller function to retrieve all purchase orders
exports.getAllPurchaseOrders = async (req, res) =>{
    try {
        const { supplierId, status, page = 1, limit = 10, sortBy = 'OrderDate', sortOrder = 'DESC', poNumber } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const order = [[sortBy, sortOrder.toUpperCase()]];
        const where = {};

        if (supplierId) {
            where.SupplierID = parseInt(supplierId);
        }
        if (status) {
            where.OrderStatus = status;
        }
        if (poNumber) {
            where.PONumber = { [Op.like]: `%${poNumber}%` };
        }

        const { count, rows } = await PurchaseOrder.findAndCountAll({
            where,
            include: [Supplier, { model: User, as: 'CreatedByUser' }, { model: Address, as: 'ShippingAddress' }, { model: Address, as: 'BillingAddress' }],
            offset: parseInt(offset),
            limit: parseInt(limit),
            order
        });

        logger.info('Retrieved all purchase orders');
        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            pageSize: parseInt(limit),
            purchaseOrders: rows
        });
    } catch (error) {
        logger.error('Error retrieving all purchase orders:', error);
        res.status(500).json({ message: 'Failed to retrieve purchase orders', error: error.message });
    }
}

// Controller function to retrieve a specific purchase order by ID
exports.getPurchaseOrderById = async (req, res) =>{
    const errors = handleValidationErrors(req, res);
    if (errors) return;

    const { id } = req.params;

    try {
        const purchaseOrder = await PurchaseOrder.findByPk(id, {
            include: [
                PurchaseOrderLineItem,
                Supplier,
                { model: User, as: 'CreatedByUser' },
                { model: Address, as: 'ShippingAddress' },
                { model: Address, as: 'BillingAddress' }
            ]
        });

        if (!purchaseOrder) {
            logger.warn(`Purchase order not found with ID: ${id}`);
            return res.status(404).json({ message: 'Purchase order not found' });
        }

        logger.info(`Retrieved purchase order with ID: ${id}`);
        res.status(200).json(purchaseOrder);
    } catch (error) {
        logger.error(`Error retrieving purchase order with ID ${id}:`, error);
        res.status(500).json({ message: 'Failed to retrieve purchase order', error: error.message });
    }
}

// Controller function to update an existing purchase order
exports.updatePurchaseOrder = async (req, res) =>{
    const errors = handleValidationErrors(req, res);
    if (errors) return;

    const { id } = req.params;
    const {
        PONumber,
        SupplierID,
        OrderDate,
        ExpectedDeliveryDate,
        ShippingAddress,
        BillingAddress,
        OrderStatus,
        Notes
    } = req.body;

    try {
        const purchaseOrder = await PurchaseOrder.findByPk(id);
        if (!purchaseOrder) {
            logger.warn(`Purchase order not found with ID: ${id}`);
            return res.status(404).json({ message: 'Purchase order not found' });
        }

        // Authorization: Allow purchaser or admin to update
        if (req.user.role !== 'admin' && (req.user.role !== 'purchaser' || purchaseOrder.OrderCreatedByUserID !== req.user.UserID)) {
            logger.warn(`User ${req.user.UserID} with role ${req.user.role} not authorized to update purchase order ${id}`);
            return res.status(403).json({ message: 'Not authorized to update this purchase order' });
        }

        const shippingAddressId = await createOrUpdateAddress(ShippingAddress, purchaseOrder.ShippingAddressID);
        const billingAddressId = await createOrUpdateAddress(BillingAddress, purchaseOrder.BillingAddressID);

        await purchaseOrder.update({
            PONumber,
            SupplierID,
            OrderDate,
            ExpectedDeliveryDate,
            ShippingAddressID: shippingAddressId,
            BillingAddressID: billingAddressId,
            OrderStatus,
            Notes
        });

        const updatedPurchaseOrder = await PurchaseOrder.findByPk(id, {
            include: [
                PurchaseOrderLineItem,
                Supplier,
                { model: User, as: 'CreatedByUser' },
                { model: Address, as: 'ShippingAddress' },
                { model: Address, as: 'BillingAddress' }
            ]
        });

        logger.info(`Purchase order updated successfully with ID: ${id}`);
        res.status(200).json(updatedPurchaseOrder);
    } catch (error) {
        logger.error(`Error updating purchase order with ID ${id}:`, error);
        res.status(500).json({ message: 'Failed to update purchase order', error: error.message });
    }
}

// Controller function to delete a purchase order
exports.deletePurchaseOrder = async (req, res) => {
    const errors = handleValidationErrors(req, res);
    if (errors) return;

    const { id } = req.params;

    try {
        const purchaseOrder = await PurchaseOrder.findByPk(id);
        if (!purchaseOrder) {
            logger.warn(`Purchase order not found with ID: ${id}`);
            return res.status(404).json({ message: 'Purchase order not found' });
        }

        // Authorization: Only admin can delete
        if (req.user.role !== 'admin') {
            logger.warn(`User ${req.user.UserID} with role ${req.user.role} not authorized to delete purchase order ${id}`);
            return res.status(403).json({ message: 'Not authorized to delete this purchase order' });
        }

        await purchaseOrder.destroy();
        logger.info(`Purchase order deleted successfully with ID: ${id}`);
        res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting purchase order with ID ${id}:`, error);
        res.status(500).json({ message: 'Failed to delete purchase order', error: error.message });
    }
}

// Controller function to add a line item to a purchase order
exports.addLineItemToPurchaseOrder = async (req, res) => {
    const errors = handleValidationErrors(req, res);
    if (errors) return;

    const { purchaseOrderId } = req.params;
    const { ProductID, QuantityOrdered, UnitOfMeasure, UnitPrice, ExpectedDeliveryDate } = req.body;

    try {
        const purchaseOrder = await PurchaseOrder.findByPk(purchaseOrderId);
        if (!purchaseOrder) {
            logger.warn(`Purchase order not found with ID: ${purchaseOrderId}`);
            return res.status(404).json({ message: 'Purchase order not found' });
        }

        const newLineItem = await PurchaseOrderLineItem.create({
            PurchaseOrderID: parseInt(purchaseOrderId),
            ProductID,
            QuantityOrdered,
            UnitOfMeasure,
            UnitPrice,
            ExpectedDeliveryDate
        });

        const updatedPurchaseOrder = await PurchaseOrder.findByPk(purchaseOrderId, {
            include: [PurchaseOrderLineItem, Supplier, { model: User, as: 'CreatedByUser' }, { model: Address, as: 'ShippingAddress' }, { model: Address, as: 'BillingAddress' }]
        });

        logger.info(`Line item added to purchase order ID ${purchaseOrderId}`);
        res.status(201).json(updatedPurchaseOrder);
    } catch (error) {
        logger.error(`Error adding line item to purchase order ID ${purchaseOrderId}:`, error);
        res.status(500).json({ message: 'Failed to add line item', error: error.message });
    }
}

// Controller function to retrieve all line items for a specific purchase order with pagination and filtering
exports.getAllPurchaseOrderLineItems = async (req, res) =>{
    const errors = handleValidationErrors(req, res);
    if (errors) return;

    const { purchaseOrderId } = req.params;
    const { page = 1, limit = 10, sortBy = 'PurchaseOrderLineItemID', sortOrder = 'ASC', productId } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const order = [[sortBy, sortOrder.toUpperCase()]];
    const where = { PurchaseOrderID: purchaseOrderId };

    if (productId) {
        where.ProductID = parseInt(productId);
    }

    try {
        const purchaseOrder = await PurchaseOrder.findByPk(purchaseOrderId);
        if (!purchaseOrder) {
            logger.warn(`Purchase order not found with ID: ${purchaseOrderId}`);
            return res.status(404).json({ message: 'Purchase order not found' });
        }

        const { count, rows } = await PurchaseOrderLineItem.findAndCountAll({
            where,
            offset: parseInt(offset),
            limit: parseInt(limit),
            order
        });

        logger.info(`Retrieved all line items for purchase order ID: ${purchaseOrderId}`);
        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            pageSize: parseInt(limit),
            lineItems: rows
        });
    } catch (error) {
        logger.error(`Error retrieving line items for purchase order ID ${purchaseOrderId}:`, error);
        res.status(500).json({ message: 'Failed to retrieve line items', error: error.message });
    }
}

// Controller function to retrieve a specific purchase order line item by ID
exports.getPurchaseOrderLineItemById = async (req, res) => {
    const errors = handleValidationErrors(req, res);
    if (errors) return;

    const { lineItemId } = req.params;

    try {
        const lineItem = await PurchaseOrderLineItem.findByPk(lineItemId);
        if (!lineItem) {
            logger.warn(`Line item not found with ID: ${lineItemId}`);
            return res.status(404).json({ message: 'Line item not found' });
        }

        logger.info(`Retrieved line item with ID: ${lineItemId}`);
        res.status(200).json(lineItem);
    } catch (error) {
        logger.error(`Error retrieving line item with ID ${lineItemId}:`, error);
        res.status(500).json({ message: 'Failed to retrieve line item', error: error.message });
    }
}

// Controller function to update an existing purchase order line item
exports.updatePurchaseOrderLineItem = async (req, res) => {
    const errors = handleValidationErrors(req, res);
    if (errors) return;

    const { lineItemId } = req.params;
    const { ProductID, QuantityOrdered, UnitOfMeasure, UnitPrice, ExpectedDeliveryDate } = req.body;

    try {
        const lineItem = await PurchaseOrderLineItem.findByPk(lineItemId);
        if (!lineItem) {
            logger.warn(`Line item not found with ID: ${lineItemId}`);
            return res.status(404).json({ message: 'Line item not found' });
        }

        const purchaseOrder = await PurchaseOrder.findByPk(lineItem.PurchaseOrderID);
        if (!purchaseOrder) {
            logger.warn(`Purchase order not found with ID: ${lineItem.PurchaseOrderID} for line item ${lineItemId}`);
            return res.status(404).json({ message: 'Purchase order not found for this line item' });
        }

        // Authorization: Allow purchaser or admin to update line item
        if (req.user.role !== 'admin' && (req.user.role !== 'purchaser' || purchaseOrder.OrderCreatedByUserID !== req.user.UserID)) {
            logger.warn(`User ${req.user.UserID} with role ${req.user.role} not authorized to update line item ${lineItemId}`);
            return res.status(403).json({ message: 'Not authorized to update this line item' });
        }

        await lineItem.update({
            ProductID,
            QuantityOrdered,
            UnitOfMeasure,
            UnitPrice,
            ExpectedDeliveryDate
        });

        const updatedLineItem = await PurchaseOrderLineItem.findByPk(lineItemId);
        logger.info(`Line item updated successfully with ID: ${lineItemId}`);
        res.status(200).json(updatedLineItem);
    } catch (error) {
        logger.error(`Error updating line item with ID ${lineItemId}:`, error);
        res.status(500).json({ message: 'Failed to update line item', error: error.message });
    }
}

// Controller function to delete a purchase order line item
exports.deletePurchaseOrderLineItem = async (req, res)=> {
    const errors = handleValidationErrors(req, res);
    if (errors) return;

    const { lineItemId } = req.params;

    try {
        const lineItem = await PurchaseOrderLineItem.findByPk(lineItemId);
        if (!lineItem) {
            logger.warn(`Line item not found with ID: ${lineItemId}`);
            return res.status(404).json({ message: 'Line item not found' });
        }

        const purchaseOrder = await PurchaseOrder.findByPk(lineItem.PurchaseOrderID);
        if (!purchaseOrder) {
            logger.warn(`Purchase order not found with ID: ${lineItem.PurchaseOrderID} for line item ${lineItemId}`);
            return res.status(404).json({ message: 'Purchase order not found for this line item' });
        }

        // Authorization: Allow purchaser or admin to delete line item
        if (req.user.role !== 'admin' && (req.user.role !== 'purchaser' || purchaseOrder.OrderCreatedByUserID !== req.user.UserID)) {
            logger.warn(`User ${req.user.UserID} with role ${req.user.role} not authorized to delete line item ${lineItemId}`);
            return res.status(403).json({ message: 'Not authorized to delete this line item' });
        }

        await lineItem.destroy();
        logger.info(`Line item deleted successfully with ID: ${lineItemId}`);
        res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting line item with ID ${lineItemId}:`, error);
        res.status(500).json({ message: 'Failed to delete line item', error: error.message });
    }
}


