const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define the User model
const User = sequelize.define('User', {
    UserID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    FirstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    LastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
   
    AddressID: { 
        type: DataTypes.INTEGER,
        references: {
            model: 'Addresses', 
            key: 'AddressID'
        }
    },
    Phone: {
        type: DataTypes.STRING,
    },
    IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    IsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    CreatedByUserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'UserID'
        }
    },
    ModifiedByUserID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'UserID'
        }
    },
    SystemTimestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
},
{
    timestamps: true,
    tableName: 'user',
});

module.exports = User;
