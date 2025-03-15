const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// New Entity: ReturnAuthorization (RMA)
const ReturnAuthorization = sequelize.define('ReturnAuthorization', {
    RMAID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    RMANumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    OrderID: { // Foreign key
        type: DataTypes.INTEGER,
        references: {
            model: 'OutboundOrders',
            key: 'OrderID'
        }
    },
    ShipmentID: { // Foreign key
        type: DataTypes.INTEGER,
        references: {
            model: 'Shipments',
            key: 'ShipmentID'
        }
    },
    ReturnDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    ReasonForReturn: {
        type: DataTypes.STRING(255),
    },
    ReturnStatus: {
        type: DataTypes.STRING(50),
        defaultValue: 'Pending',
    },
    RequestedByUserID: { // Foreign key
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'UserID'
        }
    },
    ApprovedByUserID: { // Foreign key
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'UserID'
        }
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
    timestamps: false,
    freezeTableName: true,
});

module.exports = ReturnAuthorization;