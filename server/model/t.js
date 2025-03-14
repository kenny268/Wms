const { DataTypes } = require('sequelize');
const sequelize = require('./database'); // Assuming you have your Sequelize instance configured in './database.js'

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
});

// Define the Receipt model
const Receipt = sequelize.define('Receipt', {
    ReceiptID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ReceiptDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    ExpectedDeliveryDate: {
        type: DataTypes.DATEONLY,
    },
    CarrierName: {
        type: DataTypes.STRING,
    },
    TrackingNumber: {
        type: DataTypes.STRING,
    },
    PONumber: {
        type: DataTypes.STRING,
    },
    NumberOfPallets: {
        type: DataTypes.INTEGER,
    },
    SealNumbers: {
        type: DataTypes.STRING,
    },
    TemperatureOnArrival: {
        type: DataTypes.DECIMAL(5, 2),
    },
    ConditionOnArrival: {
        type: DataTypes.TEXT,
    },
    DriverName: {
        type: DataTypes.STRING,
    },
    UnloadingStartTime: {
        type: DataTypes.DATE,
    },
    UnloadingEndTime: {
        type: DataTypes.DATE,
    },
    ReceivingBayLocation: {
        type: DataTypes.STRING(50),
    },
    SystemTimestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    Notes: {
        type: DataTypes.TEXT,
    },
    InspectionStatus: {
        type: DataTypes.STRING(50),
    },
    InspectionDateTime: {
        type: DataTypes.DATE,
    },
    SampleSizeInspected: {
        type: DataTypes.INTEGER,
    },
});

// Define the ReceiptLineItem model
const ReceiptLineItem = sequelize.define('ReceiptLineItem', {
    ReceiptLineItemID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    ExpectedQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ReceivedQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    UnitOfMeasure: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    LotNumber: {
        type: DataTypes.STRING,
    },
    ExpirationDate: {
        type: DataTypes.DATEONLY,
    },
    SerialNumber: {
        type: DataTypes.STRING,
    },
    ConditionOnReceipt: {
        type: DataTypes.TEXT,
    },
    CountryOfOrigin: {
        type: DataTypes.STRING(100),
    },
});

// Define Associations (Relationships between tables)

// Receipt has many ReceiptLineItems
Receipt.hasMany(ReceiptLineItem, { foreignKey: 'ReceiptID', onDelete: 'CASCADE' });
ReceiptLineItem.belongsTo(Receipt, { foreignKey: 'ReceiptID' });

// ReceiptLineItem belongs to Product
ReceiptLineItem.belongsTo(Product, { foreignKey: 'ProductID' });
Product.hasMany(ReceiptLineItem, { foreignKey: 'ProductID' });

// Receipt belongs to Supplier
Receipt.belongsTo(Supplier, { foreignKey: 'SupplierID' });
Supplier.hasMany(Receipt, { foreignKey: 'SupplierID' });

// Receipt belongs to Receiver User
Receipt.belongsTo(User, { foreignKey: 'ReceiverUserID', as: 'Receiver' }); // Using alias for clarity
User.hasMany(Receipt, { foreignKey: 'ReceiverUserID', as: 'ReceivedReceipts' });

// Receipt might belong to Inspector User
Receipt.belongsTo(User, { foreignKey: 'InspectorUserID', as: 'Inspector' }); // Using alias
User.hasMany(Receipt, { foreignKey: 'InspectorUserID', as: 'InspectedReceipts' });

// Export the models
module.exports = {
    Receipt,
    ReceiptLineItem,
    Product,
    Supplier,
    User,
    sequelize // Export the Sequelize instance if needed elsewhere
};