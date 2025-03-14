// New Entity: ProductCategory
const ProductCategory = sequelize.define('ProductCategory', {
    CategoryID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    CategoryName: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
    },
    Description: {
        type: DataTypes.TEXT,
    },
});