const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const UserRole = sequelize.define('UserRole', {
    UserRoleID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    UserID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'UserID'
        }
    },
    RoleID: { // Foreign key
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Roles',
            key: 'RoleID'
        }
    },
}, {
    uniqueKeys: {
        uniqueUserRole: {
            fields: ['UserID', 'RoleID']
        }
    }
},
{
    timestamps: false,
    tableName: 'user_roles',
    indexes: [
        {
            unique: true,
            fields: ['UserID', 'RoleID']
        }
    ]
}
);

module.exports = UserRole;