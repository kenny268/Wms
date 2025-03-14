// New Entity: WarehouseLocation
const WarehouseLocation = sequelize.define('WarehouseLocation', {
    LocationID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    LocationCode: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
    },
    LocationName: {
        type: DataTypes.STRING(100),
    },
    LocationType: {
        type: DataTypes.ENUM('Receiving', 'Storage', 'Picking', 'Shipping', 'Quarantine'),
        allowNull: false,
    },
    Capacity: {
        type: DataTypes.INTEGER, // Or perhaps dimensions/volume
    },
    Notes: {
        type: DataTypes.TEXT,
    },
});