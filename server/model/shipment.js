// New Entity: Shipment
const Shipment = sequelize.define('Shipment', {
    ShipmentID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    OrderID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ShipmentNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    ShipmentDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    CarrierName: {
        type: DataTypes.STRING,
    },
    TrackingNumber: {
        type: DataTypes.STRING,
    },
    ShippingCost: {
        type: DataTypes.DECIMAL(10, 2),
    },
    ShippedByUserID: {
        type: DataTypes.INTEGER,
    },
    DepartureTime: {
        type: DataTypes.DATE,
    },
    EstimatedArrivalTime: {
        type: DataTypes.DATE,
    },
    DeliveryConfirmationNumber: {
        type: DataTypes.STRING,
    },
    DeliveryDateTime: {
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
