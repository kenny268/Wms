const { sequelize, DataTypes } = require('../config/db');

const ProductLot = sequelize.define('ProductLot', {
    ProductLotID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ProductID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Products',
            key: 'ProductID'
        }
    },
    LotNumber: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ExpirationDate: {
        type: DataTypes.DATEONLY,
    },
    SystemTimestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    uniqueKeys: {
        uniqueProductLot: {
            fields: ['ProductID', 'LotNumber']
        }
    }
},{
    timestamps: true,
    tableName: 'product_lots',
    indexes: [
        {
            unique: true,
            fields: ['ProductID', 'LotNumber']
        }
    ]
}
);

module.exports = ProductLot;