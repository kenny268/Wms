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