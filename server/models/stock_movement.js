const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// New Entity: StockMovement
const StockMovement = sequelize.define('StockMovement', {
    StockMovementID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    MovementType: {
        type: DataTypes.ENUM('Inbound', 'Outbound', 'Transfer', 'Adjustment'),
        allowNull: false,
    },
    ProductID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Products',
            key: 'ProductID'
        }
    },
    FromLocationID: { // Foreign key
        type: DataTypes.INTEGER,
        references: {
            model: 'WarehouseLocations',
            key: 'LocationID'
        }
    },
    ToLocationID: { // Foreign key
        type: DataTypes.INTEGER,
        references: {
            model: 'WarehouseLocations',
            key: 'LocationID'
        }
    },
    Quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    MovementDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    ReferenceID: {
        type: DataTypes.INTEGER,
    },
    ReferenceType: {
        type: DataTypes.STRING(50),
    },
    Reason: {
        type: DataTypes.STRING(255),
    },
    UserID: { // Foreign key
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
});

module.exports = StockMovement;
