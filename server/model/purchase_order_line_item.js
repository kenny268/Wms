// New Entity: PurchaseOrderLineItem
const PurchaseOrderLineItem = sequelize.define('PurchaseOrderLineItem', {
    PurchaseOrderLineItemID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    PurchaseOrderID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ProductID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    QuantityOrdered: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    UnitOfMeasure: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    UnitPrice: {
        type: DataTypes.DECIMAL(10, 2),
    },
    ExpectedDeliveryDate: {
        type: DataTypes.DATEONLY,
    },
    Notes: {
        type: DataTypes.TEXT,
    },
});
