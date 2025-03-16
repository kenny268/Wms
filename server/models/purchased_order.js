const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// New Entity: PurchaseOrder
const PurchaseOrder = sequelize.define('PurchaseOrder', {
    PurchaseOrderID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    PONumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    OrderDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    SupplierID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Suppliers',
            key: 'SupplierID'
        }
    },
    OrderCreatedByUserID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'UserID'
        }
    },
    OrderStatus: {
        type: DataTypes.STRING(50),
        defaultValue: 'Pending',
    },
    TotalAmount: {
        type: DataTypes.DECIMAL(15, 2),
    },
    ExpectedDeliveryDate: {
        type: DataTypes.DATEONLY,
    },
    ShippingAddressID: { // Foreign key
        type: DataTypes.INTEGER,
        references: {
            model: 'Addresses',
            key: 'AddressID'
        }
    },
    BillingAddressID: { // Foreign key
        type: DataTypes.INTEGER,
        references: {
            model: 'Addresses',
            key: 'AddressID'
        }
    },
    Notes: {
        type: DataTypes.TEXT,
    },
    SystemTimestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});


module.exports = PurchaseOrder;
