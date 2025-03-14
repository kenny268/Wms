// New Entity: PurchaseOrder
const PurchaseOrder = sequelize.define('PurchaseOrder', {
    PurchaseOrderID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    PONumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    OrderDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    SupplierID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    OrderCreatedByUserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    OrderStatus: {
        type: DataTypes.STRING(50),
        defaultValue: 'Pending', // e.g., Pending, Approved, Partially Received, Received, Cancelled
    },
    TotalAmount: {
        type: DataTypes.DECIMAL(15, 2),
    },
    ExpectedDeliveryDate: {
        type: DataTypes.DATEONLY,
    },
    ShippingAddress: {
        type: DataTypes.TEXT,
    },
    BillingAddress: {
        type: DataTypes.TEXT,
    },
    Notes: {
        type: DataTypes.TEXT,
    },
    SystemTimestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});
