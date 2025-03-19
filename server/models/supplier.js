const { sequelize, DataTypes } = require('../config/db');

// Define the Supplier model
const Supplier = sequelize.define('Supplier', {
    SupplierID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    
    },
    CompanyName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    ContactName: {
        type: DataTypes.STRING,
    },
    ContactTitle: {
        type: DataTypes.STRING,
    },
    Phone: {
        type: DataTypes.STRING,
    },
    Fax: {
        type: DataTypes.STRING,
    },
    Email: {
        type: DataTypes.STRING,
    },
    HomePage: {
        type: DataTypes.STRING,
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
    tableName: 'Suppliers',
});
module.exports = Supplier;
