const { sequelize, DataTypes } = require('../config/db');

// New Entity: PurchaseOrderLineItem
const PurchaseOrderLineItem = sequelize.define('PurchaseOrderLineItem', {
    PurchaseOrderLineItemID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    PurchaseOrderID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'PurchaseOrders',
            key: 'PurchaseOrderID',
            onDelete: 'CASCADE'
        }
    },
    ProductID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Products',
            key: 'ProductID'
        }
    },
    QuantityOrdered: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    UnitOfMeasure: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    UnitPrice: {
        type: DataTypes.DECIMAL(10, 2),
    },
    ExpectedDeliveryDate: {
        type: DataTypes.DATEONLY,
    },
    Notes: {
        type: DataTypes.TEXT,
    },
    UOMID: { // Foreign key for UnitOfMeasure
        type: DataTypes.INTEGER,
        references: {
            model: 'UnitOfMeasures',
            key: 'UOMID'
        }
    },
});

module.exports = PurchaseOrderLineItem;
