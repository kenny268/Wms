const { sequelize, DataTypes } = require('../config/db');

// New Entity: ShipmentLineItem (Details of products in a shipment)
const ShipmentLineItem = sequelize.define('ShipmentLineItem', {
    ShipmentLineItemID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ShipmentID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Shipments',
            key: 'ShipmentID',
            onDelete: 'CASCADE'
        }
    },
    OrderItemID: { // Foreign key
        type: DataTypes.INTEGER,
        references: {
            model: 'OutboundOrderLineItems',
            key: 'OrderItemID'
        }
    },
    ProductID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Products',
            key: 'ProductID'
        }
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
},
{
    timestamps: false,
    tableName: 'shipment_line_items',
});

module.exports = ShipmentLineItem;
