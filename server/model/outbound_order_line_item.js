// New Entity: OutboundOrderLineItem
const OutboundOrderLineItem = sequelize.define('OutboundOrderLineItem', {
    OrderItemID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    OrderID: {
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
    QuantityShipped: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    UnitOfMeasure: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    UnitPrice: {
        type: DataTypes.DECIMAL(10, 2),
    },
    Notes: {
        type: DataTypes.TEXT,
    },
});
