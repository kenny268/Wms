const { sequelize, DataTypes } = require('../config/db');


// New Entity: OutboundOrderLineItem
const OutboundOrderLineItem = sequelize.define('OutboundOrderLineItem', {
    OrderItemID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    OrderID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'OutboundOrders',
            key: 'OrderID',
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
    QuantityShipped: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    UnitOfMeasure: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    UnitPrice: {
        type: DataTypes.DECIMAL(10, 2),
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
},
{
    timestamps: false,
    tableName: 'OutboundOrderLineItems',
});

module.exports = OutboundOrderLineItem;
