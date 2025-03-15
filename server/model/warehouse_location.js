const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// New Entity: WarehouseLocation
const WarehouseLocation = sequelize.define('WarehouseLocation', {
    LocationID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    LocationCode: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
    },
    LocationName: {
        type: DataTypes.STRING(100),
    },
    LocationType: {
        type: DataTypes.ENUM('Warehouse', 'Zone', 'Aisle', 'Rack', 'Shelf', 'Bin', 'Chamber', 'Other'),
        allowNull: false,
    },
    ParentLocationID: {
        type: DataTypes.INTEGER,
        references: {
            model: 'WarehouseLocations',
            key: 'LocationID'
        },
        allowNull: true, // Can be null for top-level locations (e.g., Warehouses)
    },
    Capacity: {
        type: DataTypes.INTEGER, // Or perhaps dimensions/volume
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
    tableName: 'warehouse_locations',
}
);

module.exports = WarehouseLocation;