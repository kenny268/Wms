const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Role = sequelize.define('Role', {
    RoleID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    RoleName: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
    },
    Description: {
        type: DataTypes.TEXT,
    },
},
{
    timestamps: true,
    tableName: 'roles',
});

module.exports = Role;