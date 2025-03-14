const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Import all models
const Product = require('./product');
const Supplier = require('./supplier');
const User = require('./user');
const PurchaseOrder = require('./purchase_order');
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
const Receipt = require('./receipt');
const ReceiptLineItem = require('./receipt_line_item');

// --- Product Relationships ---
PurchaseOrder.belongsTo(Supplier, { foreignKey: 'SupplierID' });
Supplier.hasMany(PurchaseOrder, { foreignKey: 'SupplierID' });

PurchaseOrder.belongsTo(User, { foreignKey: 'OrderCreatedByUserID', as: 'OrderCreator' });
User.hasMany(PurchaseOrder, { foreignKey: 'OrderCreatedByUserID', as: 'CreatedOrders' });

PurchaseOrder.hasMany(PurchaseOrderLineItem, { foreignKey: 'PurchaseOrderID', onDelete: 'CASCADE' });
PurchaseOrderLineItem.belongsTo(PurchaseOrder, { foreignKey: 'PurchaseOrderID' });

PurchaseOrderLineItem.belongsTo(Product, { foreignKey: 'ProductID' });
Product.hasMany(PurchaseOrderLineItem, { foreignKey: 'ProductID' });

// --- Warehouse Location Relationships ---
// Inventory belongs to WarehouseLocation
Inventory.belongsTo(WarehouseLocation, { foreignKey: 'LocationID' });
WarehouseLocation.hasMany(Inventory, { foreignKey: 'LocationID' });

// StockMovement can have From and To locations
StockMovement.belongsTo(WarehouseLocation, { foreignKey: 'FromLocationID', as: 'FromLocation' });
WarehouseLocation.hasMany(StockMovement, { foreignKey: 'FromLocationID', as: 'DepartingMovements' });

StockMovement.belongsTo(WarehouseLocation, { foreignKey: 'ToLocationID', as: 'ToLocation' });
WarehouseLocation.hasMany(StockMovement, { foreignKey: 'ToLocationID', as: 'ArrivingMovements' });

// --- Inventory Relationships ---
Inventory.belongsTo(Product, { foreignKey: 'ProductID' });
Product.hasMany(Inventory, { foreignKey: 'ProductID' });

// --- Stock Movement Relationships ---
StockMovement.belongsTo(Product, { foreignKey: 'ProductID' });
Product.hasMany(StockMovement, { foreignKey: 'ProductID' });

StockMovement.belongsTo(User, { foreignKey: 'UserID', as: 'Mover' });
User.hasMany(StockMovement, { foreignKey: 'UserID', as: 'MovementsPerformed' });

// --- Outbound Order Relationships ---
OutboundOrder.belongsTo(User, { foreignKey: 'OrderCreatedByUserID', as: 'OrderPlacedBy' });
User.hasMany(OutboundOrder, { foreignKey: 'OrderCreatedByUserID', as: 'PlacedOrders' });

OutboundOrder.hasMany(OutboundOrderLineItem, { foreignKey: 'OrderID', onDelete: 'CASCADE' });
OutboundOrderLineItem.belongsTo(OutboundOrder, { foreignKey: 'OrderID' });

OutboundOrderLineItem.belongsTo(Product, { foreignKey: 'ProductID' });
Product.hasMany(OutboundOrderLineItem, { foreignKey: 'ProductID' });

// --- Shipment Relationships ---
Shipment.belongsTo(OutboundOrder, { foreignKey: 'OrderID' });
OutboundOrder.hasMany(Shipment, { foreignKey: 'OrderID' });

Shipment.belongsTo(User, { foreignKey: 'ShippedByUserID', as: 'Shipper' });
User.hasMany(Shipment, { foreignKey: 'ShippedByUserID', as: 'ShippedItems' });

Shipment.hasMany(ShipmentLineItem, { foreignKey: 'ShipmentID', onDelete: 'CASCADE' });
ShipmentLineItem.belongsTo(Shipment, { foreignKey: 'ShipmentID' });

ShipmentLineItem.belongsTo(OutboundOrderLineItem, { foreignKey: 'OrderItemID' });
OutboundOrderLineItem.hasMany(ShipmentLineItem, { foreignKey: 'OrderItemID' });

ShipmentLineItem.belongsTo(Product, { foreignKey: 'ProductID' });
Product.hasMany(ShipmentLineItem, { foreignKey: 'ProductID' });

// --- Return Authorization Relationships ---
ReturnAuthorization.belongsTo(OutboundOrder, { foreignKey: 'OrderID' });
OutboundOrder.hasMany(ReturnAuthorization, { foreignKey: 'OrderID' });

ReturnAuthorization.belongsTo(Shipment, { foreignKey: 'ShipmentID' });
Shipment.hasMany(ReturnAuthorization, { foreignKey: 'ShipmentID' });

ReturnAuthorization.belongsTo(User, { foreignKey: 'RequestedByUserID', as: 'ReturnRequestor' });
User.hasMany(ReturnAuthorization, { foreignKey: 'RequestedByUserID', as: 'RequestedReturns' });

ReturnAuthorization.belongsTo(User, { foreignKey: 'ApprovedByUserID', as: 'ReturnApprover' });
User.hasMany(ReturnAuthorization, { foreignKey: 'ApprovedByUserID', as: 'ApprovedReturns' });

ReturnAuthorization.hasMany(ReturnAuthorizationLineItem, { foreignKey: 'RMAID', onDelete: 'CASCADE' });
ReturnAuthorizationLineItem.belongsTo(ReturnAuthorization, { foreignKey: 'RMAID' });

ReturnAuthorizationLineItem.belongsTo(OutboundOrderLineItem, { foreignKey: 'OrderItemID' });
OutboundOrderLineItem.hasMany(ReturnAuthorizationLineItem, { foreignKey: 'OrderItemID' });

ReturnAuthorizationLineItem.belongsTo(Product, { foreignKey: 'ProductID' });
Product.hasMany(ReturnAuthorizationLineItem, { foreignKey: 'ProductID' });

// --- Product Category Relationship ---
Product.belongsTo(ProductCategory, { foreignKey: 'CategoryID' });
ProductCategory.hasMany(Product, { foreignKey: 'CategoryID' });

// --- Unit of Measure Relationships ---
// You might want to link UnitOfMeasure to Product if products have standard UOM
Product.belongsTo(UnitOfMeasure, { foreignKey: 'UOMID', as: 'BaseUnit' });
UnitOfMeasure.hasMany(Product, { foreignKey: 'UOMID', as: 'BaseProducts' });

// Link UnitOfMeasure to relevant line item tables if needed for specific order/receipt UOM
ReceiptLineItem.belongsTo(UnitOfMeasure, { foreignKey: 'UOMID' });
UnitOfMeasure.hasMany(ReceiptLineItem, { foreignKey: 'UOMID' });

PurchaseOrderLineItem.belongsTo(UnitOfMeasure, { foreignKey: 'UOMID' });
UnitOfMeasure.hasMany(PurchaseOrderLineItem, { foreignKey: 'UOMID' });

OutboundOrderLineItem.belongsTo(UnitOfMeasure, { foreignKey: 'UOMID' });
UnitOfMeasure.hasMany(OutboundOrderLineItem, { foreignKey: 'UOMID' });

// --- Linking Receipts to Purchase Orders ---
Receipt.belongsTo(PurchaseOrder, { foreignKey: 'PurchaseOrderID' });
PurchaseOrder.hasMany(Receipt, { foreignKey: 'PurchaseOrderID' });

// --- Linking Receipt Line Items to Purchase Order Line Items (Optional - for tracking received against ordered) ---
ReceiptLineItem.belongsTo(PurchaseOrderLineItem, { foreignKey: 'PurchaseOrderLineItemID' });
PurchaseOrderLineItem.hasMany(ReceiptLineItem, { foreignKey: 'PurchaseOrderLineItemID' });


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
    sequelize
};