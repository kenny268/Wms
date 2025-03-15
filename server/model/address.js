const { DataTypes } = require('sequelize')
const sequelize = require('../config/db')

const Address = sequelize.define('Address', {
    AddressID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    AddressLine1: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    AddressLine2: {
        type: DataTypes.STRING(255),
    },
    City: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    StateProvince: {
        type: DataTypes.STRING(100),
    },
    PostalCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    Country: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    AddressType: {
        type: DataTypes.STRING(50),
    },
},
{
    timestamps: false,
    tableName: 'addresses',
});
module.exports = Address;
