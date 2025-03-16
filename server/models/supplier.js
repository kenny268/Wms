const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define the Supplier model
const Supplier = sequelize.define('Supplier', {
    SupplierID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    SupplierName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    AddressID: { // Foreign key for default Address
        type: DataTypes.INTEGER,
        references: {
            model: 'Addresses', // Assuming Address model name is 'Address'
            key: 'AddressID'
        }
    },
},
{
    timestamps: true,
    tableName: 'supplier',
});
module.exports = Supplier;
