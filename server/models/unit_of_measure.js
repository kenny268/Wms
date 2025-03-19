const { sequelize, DataTypes } = require('../config/db');

// New Entity: UnitOfMeasure
const UnitOfMeasure = sequelize.define('UnitOfMeasure', {
    UOMID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    UOMCode: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: false,
    },
    UOMName: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    Description: {
        type: DataTypes.TEXT,
    },
});

module.exports = UnitOfMeasure;
