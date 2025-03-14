// New Entity: Inventory
const Inventory = sequelize.define('Inventory', {
    InventoryID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ProductID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    LocationID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    QuantityOnHand: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    QuantityAllocated: {
        type: DataTypes.INTEGER,
        defaultValue: 0, // Quantity reserved for outbound orders
    },
    QuantityAvailable: {
        type: DataTypes.INTEGER,
        get() {
            return this.getDataValue('QuantityOnHand') - this.getDataValue('QuantityAllocated');
        },
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
});