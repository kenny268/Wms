const { sequelize, DataTypes } = require('../config/db');

const Product = sequelize.define('Product', {
    ProductID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ProductCode: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    ProductName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Description: {
        type: DataTypes.TEXT,
    },
    Dimensions: {
        type: DataTypes.STRING,
    },
    Weight: {
        type: DataTypes.DECIMAL(10, 2),
    },
    CategoryID: {
        type: DataTypes.INTEGER, // Foreign key for ProductCategory
    },
    UOMID: {
        type: DataTypes.INTEGER, // Foreign key for Base Unit of Measure
    },
});


module.exports = Product;
