const { sequelize, DataTypes } = require('../config/db');


// New Entity: OutboundOrder
const OutboundOrder = sequelize.define('OutboundOrder', {
    OrderID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    OrderNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    OrderDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    // CustomerID: { // Foreign key (assuming Customer model exists)
    //     type: DataTypes.INTEGER,
    //     references: {
    //         model: 'Customers', // Assuming Customer model name
    //         key: 'CustomerID'
    //     }
    //     ,
    //     allowNull: true,
    // },
    OrderStatus: {
        type: DataTypes.STRING(50),
        defaultValue: 'Pending',
    },
    OrderCreatedByUserID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'UserID'
        }
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
    ShippingMethod: {
        type: DataTypes.STRING(100),
    },
    ExpectedShipDate: {
        type: DataTypes.DATEONLY,
    },
    Notes: {
        type: DataTypes.TEXT,
    },
    SystemTimestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
},
{
    timestamps: true,
    tableName: 'OutboundOrders',
    indexes: [
        {
            unique: true,
            fields: ['OrderNumber']
        }
    ]
}
);

module.exports = OutboundOrder;