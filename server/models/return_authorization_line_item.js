const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// New Entity: ReturnAuthorizationLineItem
const ReturnAuthorizationLineItem = sequelize.define('ReturnAuthorizationLineItem', {
    RMALineItemID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    RMAID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ReturnAuthorizations',
            key: 'RMAID',
            onDelete: 'CASCADE'
        }
    },
    OrderItemID: { // Foreign key
        type: DataTypes.INTEGER,
        references: {
            model: 'OutboundOrderLineItems',
            key: 'OrderItemID'
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
    QuantityReturned: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ConditionOnReturn: {
        type: DataTypes.TEXT,
    },
    Notes: {
        type: DataTypes.TEXT,
    },
},
{
    timestamps: false,
    tableName: 'return_authorization_line_items',
});


module.exports = ReturnAuthorizationLineItem;
