import { DataTypes } from 'sequelize';
import sequelize from '../config/db';

// New Entity: Inventory
const Inventory = sequelize.define('Inventory', {
    InventoryID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ProductLotID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'ProductLots',
            key: 'ProductLotID'
        }
    },
    LocationID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'WarehouseLocations',
            key: 'LocationID'
        }
    },
    QuantityOnHand: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    QuantityAllocated: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    SerialNumber: {
        type: DataTypes.STRING,
    },
    LastStockTakeDate: {
        type: DataTypes.DATE,
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
    tableName: 'inventories',
    indexes: [
        {
            unique: true,
            fields: ['ProductLotID', 'LocationID']
        }
    ]
}
);


module.exports = Inventory;