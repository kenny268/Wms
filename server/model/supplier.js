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
});