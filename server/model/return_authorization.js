// New Entity: ReturnAuthorization (RMA)
const ReturnAuthorization = sequelize.define('ReturnAuthorization', {
    RMAID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    RMANumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    OrderID: {
        type: DataTypes.INTEGER,
    },
    ShipmentID: {
        type: DataTypes.INTEGER,
    },
    ReturnDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    ReasonForReturn: {
        type: DataTypes.STRING(255),
    },
    ReturnStatus: {
        type: DataTypes.STRING(50),
        defaultValue: 'Pending', // e.g., Pending, Approved, Received, Inspected, Resolved
    },
    RequestedByUserID: {
        type: DataTypes.INTEGER,
    },
    ApprovedByUserID: {
        type: DataTypes.INTEGER,
    },
    Notes: {
        type: DataTypes.TEXT,
    },
    SystemTimestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});