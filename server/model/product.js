// Define the Product model
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
});
