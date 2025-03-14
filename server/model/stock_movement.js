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
    ProductID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    FromLocationID: {
        type: DataTypes.INTEGER,
    },
    ToLocationID: {
        type: DataTypes.INTEGER,
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
        type: DataTypes.INTEGER, // Could be ReceiptID, ShipmentID, etc.
    },
    ReferenceType: {
        type: DataTypes.STRING(50), // e.g., 'Receipt', 'Shipment', 'StockTake'
    },
    Reason: {
        type: DataTypes.STRING(255), // For adjustments or transfers
    },
    UserID: {
        type: DataTypes.INTEGER, // User who performed the movement
    },
    Notes: {
        type: DataTypes.TEXT,
    },
    SystemTimestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});