// New Entity: ShipmentLineItem (Details of products in a shipment)
const ShipmentLineItem = sequelize.define('ShipmentLineItem', {
    ShipmentLineItemID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ShipmentID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    OrderItemID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ProductID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    QuantityShipped: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    LotNumber: {
        type: DataTypes.STRING,
    },
    SerialNumber: {
        type: DataTypes.STRING,
    },
});