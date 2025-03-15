const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// New Entity: StockTake
const StockTake = sequelize.define('StockTake', {
    StockTakeID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    StockTakeNumber: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
    },
    StartDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    EndDate: {
        type: DataTypes.DATE,
    },
    InitiatedByUserID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'UserID'
        }
    },
    Status: {
        type: DataTypes.ENUM('Planning', 'InProgress', 'Completed', 'Verified', 'Cancelled'),
        defaultValue: 'Planning',
        allowNull: false,
    },
    Notes: {
        type: DataTypes.TEXT,
    },
    SystemTimestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = StockTake;