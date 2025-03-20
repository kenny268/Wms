'use client';
// src/components/MainContent.js
import { useState } from "react";
import { menuItems } from "./Sidebar"; // Import menuItems

const pages = {
  inbound: <div>Inbound Section</div>,
  "receiving-goods": <div>Receiving Goods</div>,
  "purchase-orders": <div>Purchase Orders</div>,
  "return-authorization": <div>Return Authorizations</div>,
  inventory: <div>Inventory Management</div>,
  "products": <div>Products</div>,
  "stock-movement": <div>Stock Movement</div>,
  "stock-take": <div>Stock Take</div>,
  "warehouse-location": <div>Warehouse Location</div>,
  outbound: <div>Outbound Section</div>,
  "outbound-orders": <div>Outbound Orders</div>,
  shipments: <div>Shipments</div>,
  settings: <div>Settings Page</div>,
  "user-roles": <div>User Roles</div>,
  users: <div>Users</div>,
  roles: <div>Roles</div>,
  "unit-of-measure": <div>Units of Measure</div>,
  faqs: <div>FAQs</div>,
  logout: <div>Logging Out...</div>,

  // New pages from the updated menuItems
  "receiving-list": <div>Receiving List Content</div>,
  "create-receipt": <div>Create Receipt Content</div>,
  "edit-receipt": <div>Edit Receipt Content</div>,
  "add-line-items": <div>Add Line Items Content</div>,
  "receipt-details": <div>Receipt Details Content</div>,
  "po-list": <div>PO List Content</div>,
  "create-po": <div>Create PO Content</div>,
  "edit-po": <div>Edit PO Content</div>,
  "po-details": <div>PO Details Content</div>,
  "add-po-line-item": <div>Add PO Line Item Content</div>,
  "ra-list": <div>RA List Content</div>,
  "create-ra": <div>Create RA Content</div>,
  "edit-ra": <div>Edit RA Content</div>,
  "ra-details": <div>RA Details Content</div>,
  "add-ra-line-item": <div>Add RA Line Item Content</div>,
  table: <div>Table Content</div>,
  "search-input": <div>Search Input Content</div>,
  pagination: <div>Pagination Content</div>,
  "create-product": <div>Create Product Content</div>,
  "edit-product": <div>Edit Product Content</div>,
  "stock-movement-list": <div>Stock Movement List Content</div>,
  "create-stock-movement": <div>Create Stock Movement Content</div>,
  "edit-stock-movement": <div>Edit Stock Movement Content</div>,
  "stock-take-list": <div>Stock Take List Content</div>,
  "create-stock-take": <div>Create Stock Take Content</div>,
  "edit-stock-take": <div>Edit Stock Take Content</div>,
  "warehouse-location-list": <div>Warehouse Location List Content</div>,
  "create-warehouse-location": <div>Create Warehouse Location Content</div>,
  "edit-warehouse-location": <div>Edit Warehouse Location Content</div>,
  "outbound-order-list": <div>Outbound Order List Content</div>,
  "create-outbound-order": <div>Create Outbound Order Content</div>,
  "edit-outbound-order": <div>Edit Outbound Order Content</div>,
  "outbound-order-details": <div>Outbound Order Details Content</div>,
  "add-outbound-order-line-item": <div>Add Outbound Order Line Item Content</div>,
  "shipment-list": <div>Shipment List Content</div>,
  "create-shipment": <div>Create Shipment Content</div>,
  "edit-shipment": <div>Edit Shipment Content</div>,
  "shipment-details": <div>Shipment Details Content</div>,
  "add-shipment-line-item": <div>Add Shipment Line Item Content</div>,
  "user-role-list": <div>User Role List Content</div>,
  "create-user-role": <div>Create User Role Content</div>,
  "edit-user-role": <div>Edit User Role Content</div>,
  "user-list": <div>User List Content</div>,
  "create-user": <div>Create User Content</div>,
  "edit-user": <div>Edit User Content</div>,
  "role-list": <div>Role List Content</div>,
  "create-role": <div>Create Role Content</div>,
  "edit-role": <div>Edit Role Content</div>,
  "unit-of-measure-list": <div>Unit Of Measure List Content</div>,
  "create-unit-of-measure": <div>Create Unit Of Measure Content</div>,
  "edit-unit-of-measure": <div>Edit Unit Of Measure Content</div>,
};

const MainContent = ({ activePage }) => {
  const [activeTab, setActiveTab] = useState(null);

  const renderTabs = (tabs) => {
    return (
      <div className="flex space-x-4 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded ${activeTab === tab.key ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {tab.name}
          </button>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    const directPage = pages[activePage];
    if (directPage) {
      console.log(`[MainContent] Direct page found for: ${activePage}`);
      return directPage;
    }
  
    console.log(`[MainContent] Active Page: ${activePage}`);
  
    for (const menuItem of menuItems) {
      if (menuItem.subItems) {
        for (const subItem of menuItem.subItems) {
          console.log(`[MainContent] Checking subItem: ${subItem.key}`);
          if (subItem.key === activePage) {
            console.log(`[MainContent] Found matching subItem: ${subItem.key}`);
            if (subItem.subItems) {
              console.log(`[MainContent] Rendering tabs for: ${subItem.key}`, subItem.subItems);
              return (
                <>
                  {renderTabs(subItem.subItems)}
                  <div>{pages[activeTab] || <div>Select a tab</div>}</div>
                </>
              );
            } else {
              console.log(`[MainContent] No subItems for matching subItem: ${subItem.key}`);
            }
          }
        }
      }
    }
  
    console.log("[MainContent] No specific content found.");
    return <div>Select a menu item</div>;
  };
  return (
    <div className="w-3/4 flex flex-col">
      <div className="bg-gray-200 p-4 shadow-md flex justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Profile</button>
      </div>
      <div className="p-5">{renderContent()}</div>
    </div>
  );
};

export default MainContent;