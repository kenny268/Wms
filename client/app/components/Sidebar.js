'use client';
// src/components/Sidebar.js
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaWarehouse, FaBoxOpen, FaSignOutAlt, FaCog, FaInfoCircle, FaTruckLoading, FaBoxes, FaChevronRight, FaChevronDown } from "react-icons/fa";

const roles = {
  admin: ["inbound", "inventory", "outbound", "settings", "faqs", "logout"],
  manager: ["inventory", "outbound", "settings", "faqs"],
  employee: ["inbound", "inventory", "faqs"],
  guest: ["faqs", "login"],
};

export const menuItems = [ // Add 'export' here
  {
    name: "Inbound",
    icon: <FaTruckLoading />,
    key: "inbound",
    subItems: [
      {
        name: "Receiving Goods",
        key: "receiving-goods",
        subItems: [
          { name: "ReceivingList", key: "receiving-list" },
          { name: "CreateReceipt", key: "create-receipt" },
          { name: "AddLineItems", key: "add-line-items" },
          { name: "ReceiptDetails", key: "receipt-details" },
        ],
      },
      {
        name: "Purchase Orders",
        key: "purchase-orders",
        subItems: [
          { name: "POList", key: "po-list" },
          { name: "CreatePO", key: "create-po" },
          { name: "PODetails", key: "po-details" },
          { name: "AddPOLineItem", key: "add-po-line-item" },
        ],
      },
      {
        name: "Return Authorizations",
        key: "return-authorization",
        subItems: [
          { name: "RAList", key: "ra-list" },
          { name: "CreateRA", key: "create-ra" },
          { name: "RADetails", key: "ra-details" },
          { name: "AddRALineItem", key: "add-ra-line-item" },
        ],
      },
    ],
  },
  {
    name: "Inventory",
    icon: <FaBoxes />,
    key: "inventory",
    subItems: [
      {
        name: "Products",
        key: "products",
        subItems: [
          { name: "CreateProduct", key: "create-product" },
          { name: "EditProduct", key: "edit-product" },
          {name:"ProductList", key:"product-list"}
        ],
      },

      {
        name: "Stock",
        key: "stock",
        subItems: [
          { name: "StockMovementList", key: "stock-movement-list" },
          { name: "CreateStockMovement", key: "create-stock-movement" },
          { name: "StockTakeList", key: "stock-take-list" },
          { name: "CreateStockTake", key: "create-stock-take" },
        ],
      },
      {
        name: "Warehouse",
        key: "warehouse",
        subItems: [
          { name: "WarehouseLocationList", key: "warehouse-location-list" },
          { name: "CreateWarehouseLocation", key: "create-warehouse-location" },
        ],
      },

    ],
  },
  {
    name: "Outbound",
    icon: <FaBoxOpen />,
    key: "outbound",
    subItems: [
      {
        name: "Outbound Orders",
        key: "outbound-orders",
        subItems: [
          { name: "OutboundOrderList", key: "outbound-order-list" },
          { name: "CreateOutboundOrder", key: "create-outbound-order" },
          { name: "OutboundOrderDetails", key: "outbound-order-details" },
          { name: "AddOutboundOrderLineItem", key: "add-outbound-order-line-item" },
        ],
      },
      {
        name: "Shipments",
        key: "shipments",
        subItems: [
          { name: "ShipmentList", key: "shipment-list" },
          { name: "CreateShipment", key: "create-shipment" },
          { name: "ShipmentDetails", key: "shipment-details" },
          { name: "AddShipmentLineItem", key: "add-shipment-line-item" },
        ],
      },
    ],
  },
  {
    name: "Settings",
    icon: <FaCog />,
    key: "settings",
    subItems: [
      {
        name: "User Roles",
        key: "user-roles",
        subItems: [
          { name: "UserRoleList", key: "user-role-list" },
          { name: "CreateUserRole", key: "create-user-role" },
        ],
      },
      {
        name: "Users",
        key: "users",
        subItems: [
          { name: "UserList", key: "user-list" },
          { name: "CreateUser", key: "create-user" },
          { name: "EditUser", key: "edit-user" },
        ],
      },
      {
        name: "Roles",
        key: "roles",
        subItems: [
          { name: "RoleList", key: "role-list" },
          { name: "CreateRole", key: "create-role" },
        ],
      },
      {
        name: "Units of Measure",
        key: "unit-of-measure",
        subItems: [
          { name: "UnitOfMeasureList", key: "unit-of-measure-list" },
          { name: "CreateUnitOfMeasure", key: "create-unit-of-measure" },
        ],
      },
    ],
  },
  { 
    name: "FAQs", 
    icon: <FaInfoCircle />, 
    key: "faqs" 
  },
  { 
    name: "Logout", icon: <FaSignOutAlt />, key: "logout" },
];

const Sidebar = ({ setActivePage }) => {
  const { role } = useAuth();
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="w-1/4 h-screen bg-gray-900 text-white p-5">
      <h2 className="text-xl font-bold flex items-center gap-2"><FaWarehouse /> Inventory</h2>
      <div className="mt-5">
        {menuItems.map(
          (item) =>
            roles[role]?.includes(item.key) && (
              <div key={item.key} className="p-3 hover:bg-gray-700 rounded cursor-pointer">
                <div className="flex items-center justify-between" onClick={() => item.subItems ? toggleExpand(item.key) : setActivePage(item.key)}>
                  <div className="flex items-center gap-2">{item.icon} {item.name}</div>
                  {item.subItems && (expanded[item.key] ? <FaChevronDown /> : <FaChevronRight />)}
                </div>
                {item.subItems && expanded[item.key] && (
                  <div className="ml-5 mt-2">
                    {item.subItems.map((sub) => (
                      <li key={sub.key} className="p-2 hover:bg-gray-600 rounded cursor-pointer" onClick={() => sub.subItems ? setActivePage(sub.key) : setActivePage(sub.key)}>
                        {sub.name}
                      </li>
                    ))}
                  </div>
                )}
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default Sidebar;