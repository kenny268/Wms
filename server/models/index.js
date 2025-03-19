const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Import the models
const Receipt = require('./receipt');
const ReceiptLineItem = require('./receipt_line_item');
const Product = require('./product');
const Supplier = require('./supplier');
const User = require('./user');
const PurchaseOrder = require('./purchased_order');
const PurchaseOrderLineItem = require('./purchase_order_line_item');
const WarehouseLocation = require('./warehouse_location');
const Inventory = require('./inventory');
const StockMovement = require('./stock_movement');
const OutboundOrder = require('./outbound_order');
const OutboundOrderLineItem = require('./outbound_order_line_item');
const Shipment = require('./shipment');
const ShipmentLineItem = require('./shipment_line_item');
const ReturnAuthorization = require('./return_authorization');
const ReturnAuthorizationLineItem = require('./return_authorization_line_item');
const ProductCategory = require('./product_category');
const UnitOfMeasure = require('./unit_of_measure');
const Address = require('./address');
const Role = require('./role');
const UserRole = require('./user_role');
const StockTake = require('./stock_take');
const StockTakeItem = require('./stock_take_item');
const ProductLot = require('./product_lot');


// Define Associations (Relationships between tables)
// --- Warehouse Location Relationships ---
WarehouseLocation.belongsTo(WarehouseLocation, { foreignKey: 'ParentLocationID', as: 'Parent' });
WarehouseLocation.hasMany(WarehouseLocation, { foreignKey: 'ParentLocationID', as: 'Children' });

Inventory.belongsTo(WarehouseLocation, { foreignKey: 'LocationID' });
WarehouseLocation.hasMany(Inventory, { foreignKey: 'LocationID' });

// Define unique associations for FromLocation and ToLocation once.
StockMovement.belongsTo(WarehouseLocation, { foreignKey: 'FromLocationID', as: 'FromLocation' });
WarehouseLocation.hasMany(StockMovement, { foreignKey: 'FromLocationID', as: 'DepartingMovements' });

StockMovement.belongsTo(WarehouseLocation, { foreignKey: 'ToLocationID', as: 'ToLocation' });
WarehouseLocation.hasMany(StockMovement, { foreignKey: 'ToLocationID', as: 'ArrivingMovements' });

// Association for StockTakeItem and StockMovement
StockTakeItem.belongsTo(StockMovement, { foreignKey: 'AdjustmentStockMovementID', as: 'AdjustmentMovement' });
StockMovement.hasMany(StockTakeItem, { foreignKey: 'AdjustmentStockMovementID' });

// Association for StockTakeItem and WarehouseLocation
StockTakeItem.belongsTo(WarehouseLocation, { foreignKey: 'LocationID' });
WarehouseLocation.hasMany(StockTakeItem, { foreignKey: 'LocationID' });


// --- Stock Take Relationships ---
StockTake.belongsTo(User, { foreignKey: 'InitiatedByUserID', as: 'Initiator' });
User.hasMany(StockTake, { foreignKey: 'InitiatedByUserID', as: 'InitiatedStockTakes' });

StockTake.hasMany(StockTakeItem, { foreignKey: 'StockTakeID', onDelete: 'CASCADE' });
StockTakeItem.belongsTo(StockTake, { foreignKey: 'StockTakeID' });

// --- Stock Take Item Relationships ---
StockTakeItem.belongsTo(Inventory, { foreignKey: 'InventoryID' });
Inventory.hasMany(StockTakeItem, { foreignKey: 'InventoryID' });

StockTakeItem.belongsTo(ProductLot, { foreignKey: 'ProductLotID' });
ProductLot.hasMany(StockTakeItem, { foreignKey: 'ProductLotID' });

StockTakeItem.belongsTo(User, { foreignKey: 'CountedByUserID', as: 'Counter' });
User.hasMany(StockTakeItem, { foreignKey: 'CountedByUserID', as: 'CountsPerformed' });


// Product Category Relationship
Product.belongsTo(ProductCategory, { foreignKey: 'CategoryID' });
ProductCategory.hasMany(Product, { foreignKey: 'CategoryID' });

// Unit of Measure Relationships
Product.belongsTo(UnitOfMeasure, { foreignKey: 'UOMID', as: 'BaseUnit' });
UnitOfMeasure.hasMany(Product, { foreignKey: 'UOMID', as: 'BaseProducts' });

ReceiptLineItem.belongsTo(UnitOfMeasure, { foreignKey: 'UOMID', as: 'UOM' });
UnitOfMeasure.hasMany(ReceiptLineItem, { foreignKey: 'UOMID', as: 'ReceiptLineItems' });

PurchaseOrderLineItem.belongsTo(UnitOfMeasure, { foreignKey: 'UOMID', as: 'UOM' });
UnitOfMeasure.hasMany(PurchaseOrderLineItem, { foreignKey: 'UOMID', as: 'PurchaseOrderLineItems' });

OutboundOrderLineItem.belongsTo(UnitOfMeasure, { foreignKey: 'UOMID', as: 'UOM' });
UnitOfMeasure.hasMany(OutboundOrderLineItem, { foreignKey: 'UOMID', as: 'OutboundOrderLineItems' });


// Supplier Relationships
Supplier.hasMany(PurchaseOrder, { foreignKey: 'SupplierID' });
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'SupplierID' });

Supplier.hasMany(Receipt, { foreignKey: 'SupplierID' });
Receipt.belongsTo(Supplier, { foreignKey: 'SupplierID' });

// Example where the alias is changed for unique naming
Address.hasMany(Supplier, { foreignKey: 'AddressID', as: 'SupplierAddresses' });
Supplier.belongsTo(Address, { foreignKey: 'AddressID', as: 'SupplierLocation' });


// User Relationships
User.hasMany(Receipt, { foreignKey: 'ReceiverUserID', as: 'ReceivedReceipts' });
Receipt.belongsTo(User, { foreignKey: 'ReceiverUserID', as: 'Receiver' });

User.hasMany(Receipt, { foreignKey: 'InspectorUserID', as: 'InspectedReceipts' });
Receipt.belongsTo(User, { foreignKey: 'InspectorUserID', as: 'Inspector' });

User.hasMany(PurchaseOrder, { foreignKey: 'OrderCreatedByUserID', as: 'CreatedOrders' });
PurchaseOrder.belongsTo(User, { foreignKey: 'OrderCreatedByUserID', as: 'OrderCreator' });

User.hasMany(StockMovement, { foreignKey: 'UserID', as: 'MovementsPerformed' });
StockMovement.belongsTo(User, { foreignKey: 'UserID', as: 'Mover' });

User.hasMany(OutboundOrder, { foreignKey: 'OrderCreatedByUserID', as: 'PlacedOrders' });
OutboundOrder.belongsTo(User, { foreignKey: 'OrderCreatedByUserID', as: 'OrderPlacedBy' });

User.hasMany(Shipment, { foreignKey: 'ShippedByUserID', as: 'ShippedItems' });
Shipment.belongsTo(User, { foreignKey: 'ShippedByUserID', as: 'Shipper' });

User.hasMany(ReturnAuthorization, { foreignKey: 'RequestedByUserID', as: 'ReturnRequestor' });
ReturnAuthorization.belongsTo(User, { foreignKey: 'RequestedByUserID', as: 'ReturnRequestor' });

User.hasMany(ReturnAuthorization, { foreignKey: 'ApprovedByUserID', as: 'ReturnApprover' });
ReturnAuthorization.belongsTo(User, { foreignKey: 'ApprovedByUserID', as: 'ReturnApprover' });

User.belongsToMany(Role, { through: UserRole });
Role.belongsToMany(User, { through: UserRole });

// Receipt Relationships
Receipt.hasMany(ReceiptLineItem, { foreignKey: 'ReceiptID', onDelete: 'CASCADE' });
ReceiptLineItem.belongsTo(Receipt, { foreignKey: 'ReceiptID' });

// ReceiptLineItem belongs to Product
ReceiptLineItem.belongsTo(Product, { foreignKey: 'ProductID' });
Product.hasMany(ReceiptLineItem, { foreignKey: 'ProductID' });

// Purchase Order Relationships
PurchaseOrder.hasMany(PurchaseOrderLineItem, { foreignKey: 'PurchaseOrderID', onDelete: 'CASCADE' });
PurchaseOrderLineItem.belongsTo(PurchaseOrder, { foreignKey: 'PurchaseOrderID' });

PurchaseOrderLineItem.belongsTo(Product, { foreignKey: 'ProductID' });
Product.hasMany(PurchaseOrderLineItem, { foreignKey: 'ProductID' });

PurchaseOrder.hasMany(Receipt, { foreignKey: 'PurchaseOrderID' });
Receipt.belongsTo(PurchaseOrder, { foreignKey: 'PurchaseOrderID' });

// Warehouse Location Relationships
Inventory.belongsTo(WarehouseLocation, { foreignKey: 'LocationID' });
WarehouseLocation.hasMany(Inventory, { foreignKey: 'LocationID' });


// Inventory Relationships
Inventory.belongsTo(ProductLot, { foreignKey: 'ProductLotID' });
ProductLot.hasMany(Inventory, { foreignKey: 'ProductLotID' });

ProductLot.belongsTo(Product, { foreignKey: 'ProductID' });
Product.hasMany(ProductLot, { foreignKey: 'ProductID' });

// Outbound Order Relationships
OutboundOrder.hasMany(OutboundOrderLineItem, { foreignKey: 'OrderID', onDelete: 'CASCADE' });
OutboundOrderLineItem.belongsTo(OutboundOrder, { foreignKey: 'OrderID' });

OutboundOrderLineItem.belongsTo(Product, { foreignKey: 'ProductID' });
Product.hasMany(OutboundOrderLineItem, { foreignKey: 'ProductID' });

OutboundOrder.belongsTo(Address, { foreignKey: 'ShippingAddressID', as: 'ShippingAddress' });
Address.hasMany(OutboundOrder, { foreignKey: 'ShippingAddressID', as: 'ShippingOrders' });

OutboundOrder.belongsTo(Address, { foreignKey: 'BillingAddressID', as: 'BillingAddress' });
Address.hasMany(OutboundOrder, { foreignKey: 'BillingAddressID', as: 'BillingOrders' });

// Shipment Relationships
Shipment.belongsTo(OutboundOrder, { foreignKey: 'OrderID' });
OutboundOrder.hasMany(Shipment, { foreignKey: 'OrderID' });

Shipment.hasMany(ShipmentLineItem, { foreignKey: 'ShipmentID', onDelete: 'CASCADE' });
ShipmentLineItem.belongsTo(Shipment, { foreignKey: 'ShipmentID' });

ShipmentLineItem.belongsTo(OutboundOrderLineItem, { foreignKey: 'OrderItemID' });
OutboundOrderLineItem.hasMany(ShipmentLineItem, { foreignKey: 'OrderItemID' });

ShipmentLineItem.belongsTo(Product, { foreignKey: 'ProductID' });
Product.hasMany(ShipmentLineItem, { foreignKey: 'ProductID' });

// Return Authorization Relationships
ReturnAuthorization.belongsTo(OutboundOrder, { foreignKey: 'OrderID' });
OutboundOrder.hasMany(ReturnAuthorization, { foreignKey: 'OrderID' });

ReturnAuthorization.belongsTo(Shipment, { foreignKey: 'ShipmentID' });
Shipment.hasMany(ReturnAuthorization, { foreignKey: 'ShipmentID' });

ReturnAuthorization.hasMany(ReturnAuthorizationLineItem, { foreignKey: 'RMAID', onDelete: 'CASCADE' });
ReturnAuthorizationLineItem.belongsTo(ReturnAuthorization, { foreignKey: 'RMAID' });

ReturnAuthorizationLineItem.belongsTo(OutboundOrderLineItem, { foreignKey: 'OrderItemID' });
OutboundOrderLineItem.hasMany(ReturnAuthorizationLineItem, { foreignKey: 'OrderItemID' });

ReturnAuthorizationLineItem.belongsTo(Product, { foreignKey: 'ProductID' });
Product.hasMany(ReturnAuthorizationLineItem, { foreignKey: 'ProductID' });

// Address Relationships
PurchaseOrder.belongsTo(Address, { foreignKey: 'ShippingAddressID', as: 'ShippingAddress' });
Address.hasMany(PurchaseOrder, { foreignKey: 'ShippingAddressID', as: 'ShippingPOs' });

PurchaseOrder.belongsTo(Address, { foreignKey: 'BillingAddressID', as: 'BillingAddress' });
Address.hasMany(PurchaseOrder, { foreignKey: 'BillingAddressID', as: 'BillingPOs' });

// Export the models
module.exports = {
    Receipt,
    ReceiptLineItem,
    Product,
    Supplier,
    User,
    PurchaseOrder,
    PurchaseOrderLineItem,
    WarehouseLocation,
    Inventory,
    StockMovement,
    OutboundOrder,
    OutboundOrderLineItem,
    Shipment,
    ShipmentLineItem,
    ReturnAuthorization,
    ReturnAuthorizationLineItem,
    ProductCategory,
    UnitOfMeasure,
    Address,
    Role,
    UserRole,
    StockTake,
    StockTakeItem,
    sequelize
};
