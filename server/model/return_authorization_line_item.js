// New Entity: ReturnAuthorizationLineItem
const ReturnAuthorizationLineItem = sequelize.define('ReturnAuthorizationLineItem', {
    RMALineItemID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    RMAID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    OrderItemID: {
        type: DataTypes.INTEGER,
    },
    ProductID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    QuantityReturned: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ConditionOnReturn: {
        type: DataTypes.TEXT,
    },
    Notes: {
        type: DataTypes.TEXT,
    },
});
