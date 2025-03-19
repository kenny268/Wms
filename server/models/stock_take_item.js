const { sequelize, DataTypes } = require('../config/db');

// New Entity: StockTakeItem
const StockTakeItem = sequelize.define('StockTakeItem', {
    StockTakeItemID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    StockTakeID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'StockTakes',
            key: 'StockTakeID',
            onDelete: 'CASCADE'
        }
    },
    InventoryID: { // Foreign key (optional, if you want to link to existing inventory)
        type: DataTypes.INTEGER,
        references: {
            model: 'Inventories',
            key: 'InventoryID'
        }
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
    ExpectedQuantity: {
        type: DataTypes.INTEGER,
    },
    CountedQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    CountedByUserID: { // Foreign key
        type: DataTypes.INTEGER,
        references: {
            model: 'Users',
            key: 'UserID'
        }
    },
    CountedDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    Discrepancy: {
        type: DataTypes.INTEGER,
        get() {
            return (this.getDataValue('ExpectedQuantity') || 0) - this.getDataValue('CountedQuantity');
        },
    },
    ReasonForDiscrepancy: {
        type: DataTypes.STRING(255),
    },
    AdjustmentStockMovementID: { // Foreign key (if an adjustment was made)
        type: DataTypes.INTEGER,
        references: {
            model: 'StockMovements',
            key: 'StockMovementID'
        }
    },
    Notes: {
        type: DataTypes.TEXT,
    },
}
,
{
    timestamps: true,
    tableName: 'stock_take_items',
}
);

module.exports = StockTakeItem;