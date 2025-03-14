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