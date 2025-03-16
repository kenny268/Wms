const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define the ReceiptLineItem model
const ReceiptLineItem = sequelize.define('ReceiptLineItem', {
    ReceiptLineItemID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ReceiptID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Receipts',
            key: 'ReceiptID',
            onDelete: 'CASCADE'
        }
    },
    ProductID: { // Foreign key
        type: DataTypes.INTEGER,
        references: {
            model: 'Products',
            key: 'ProductID'
        }
    },
    ExpectedQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ReceivedQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    UnitOfMeasure: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    LotNumber: {
        type: DataTypes.STRING,
    },
    ExpirationDate: {
        type: DataTypes.DATEONLY,
    },
    SerialNumber: {
        type: DataTypes.STRING,
    },
    ConditionOnReceipt: {
        type: DataTypes.TEXT,
    },
    CountryOfOrigin: {
        type: DataTypes.STRING(100),
    },
    UOMID: { // Foreign key for UnitOfMeasure
        type: DataTypes.INTEGER,
        references: {
            model: 'UnitOfMeasures',
            key: 'UOMID'
        }
    },
    PurchaseOrderLineItemID: { // Optional link to PO line item
        type: DataTypes.INTEGER,
        references: {
            model: 'PurchaseOrderLineItems',
            key: 'PurchaseOrderLineItemID'
        }
    },
},
{
    timestamps: true,
    tableName: 'receipt_line_item',
});

module.exports = ReceiptLineItem;