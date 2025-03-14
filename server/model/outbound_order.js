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
    CustomerID: { // Assuming you might have customer information
        type: DataTypes.INTEGER,
    },
    OrderStatus: {
        type: DataTypes.STRING(50),
        defaultValue: 'Pending', // e.g., Pending, Processing, Shipped, Delivered, Cancelled
    },
    OrderCreatedByUserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ShippingAddress: {
        type: DataTypes.TEXT,
    },
    BillingAddress: {
        type: DataTypes.TEXT,
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
});