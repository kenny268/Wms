import { useState, useEffect } from "react";
import { menuItems } from "./Sidebar"; // Import menus
import AddPOLineItem from "./Inbound/PurchaseOrders/AddPOLineItem";
import CreatePO from "./Inbound/PurchaseOrders/CreatePO";
import POList from "./Inbound/PurchaseOrders/POList";
import PODetails from "./Inbound/PurchaseOrders/PODetails";
import AddLineItems from "./Inbound/ReceivingGoods/AddLineItems";
import CreateReceipt from "./Inbound/ReceivingGoods/CreateReceipt";
import ReceiptDetails from "./Inbound/ReceivingGoods/ReceiptDetails";
import ReceivingList from "./Inbound/ReceivingGoods/ReceivingList";
import RAList from "./Inbound/ReturnAuthorizations/RAList";
import CreateRA from "./Inbound/ReturnAuthorizations/CreateRA";
import RADetails from "./Inbound/ReturnAuthorizations/RADetails";
import CreateProduct from "./Inventory/Products/CreateProduct";
import ProductList from "./Inventory/Products/ProductList";
import CreateStockMovement from "./Inventory/Stock/CreateStockMovement";
import StockMovementList from "./Inventory/Stock/StockMovementList";
import CreateStockTake from "./Inventory/Stock/CreateStockTake";
import StockTakeList from "./Inventory/Stock/StockTakeList";
import CreateWarehouseLocation from "./Inventory/Warehouse/CreateWarehouseLocation";
import WarehouseLocationList from "./Inventory/Warehouse/WarehouseLocationList";
import AddOutboundOrderLineItem from "./Outbound/OutboundOrders/AddOutboundOrderLineItem";
import CreateOutboundOrder from "./Outbound/OutboundOrders/CreateOutboundOrder";
import OutboundOrderDetails from "./Outbound/OutboundOrders/OutboundOrderDetails";
import OutboundOrderList from "./Outbound/OutboundOrders/OutboundOrderList";
import AddShipmentLineItem from "./Outbound/Shipments/AddShipmentLineItem";
import CreateShipment from "./Outbound/Shipments/CreateShipment";
import ShipmentDetails from "./Outbound/Shipments/ShipmentDetails";
import ShipmentList from "./Outbound/Shipments/ShipmentList";
import CreateRole from "./Settings/Roles/CreateRole";
import RoleList from "./Settings/Roles/RoleList";
import UserList from "./Settings/Users/UserList";
import CreateUser from "./Settings/Users/CreateUser";
import CreateUnitOfMeasure from "./Settings/UnitsofMeasure/CreateUnitOfMeasure";
import UnitOfMeasureList from "./Settings/UnitsofMeasure/UnitOfMeasureList";
import CreateUserRole from "./Settings/UserRoles/CreateUserRole";
import UserRoleList from "./Settings/UserRoles/UserRoleList";


const menus = menuItems;

const pages = {
  inbound: <div>Inbound Section</div>,
  "receiving-goods": <ReceivingList />,
  "purchase-orders": <POList />,
  "return-authorization": <RAList />,
  inventory: <div>Inventory Management</div>,
  "products": <div>Products</div>,
  "stock": <div>Stock Movement</div>,
  "warehouse": <div>Warehouse Location</div>,
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
  
  // New pages from the updated menus
  "receiving-list": <ReceivingList />,
  "create-receipt": <CreateReceipt />,
  "add-line-items": <AddLineItems />,
  "receipt-details": <ReceiptDetails />,
  "po-list": <POList />,
  "create-po": <CreatePO />,
  "po-details": <PODetails />,
  "add-po-line-item": <AddPOLineItem />,
  "ra-list": <RAList />,
  "create-ra": <CreateRA />,
  "ra-details": <RADetails />,
  "add-ra-line-item": <RADetails />,
  "create-product": <CreateProduct />,
  'product-list': <ProductList />,
  "stock-movement-list": <StockMovementList />,
  "create-stock-movement": <CreateStockMovement />,
  "stock-take-list": <StockTakeList />,
  "create-stock-take": <CreateStockTake />,
  "warehouse-location-list": <WarehouseLocationList />,
  "create-warehouse-location": <CreateWarehouseLocation />,
  "outbound-order-list": <OutboundOrderList />,
  "create-outbound-order": <CreateOutboundOrder />,
  "outbound-order-details": <OutboundOrderDetails />,
  "add-outbound-order-line-item": <AddOutboundOrderLineItem />,
  "shipment-list": <ShipmentList />,
  "create-shipment": <CreateShipment />,
  "shipment-details": <ShipmentDetails />,
  "add-shipment-line-item": <AddShipmentLineItem />,
  "role-list": <RoleList />,
  "create-role": <CreateRole />,
  "unit-of-measure-list": <UnitOfMeasureList />,
  "create-unit-of-measure": <CreateUnitOfMeasure />,
  "user-list": <UserList />,
  "create-user": <CreateUser />,
  "create-user-role": <CreateUserRole />,
  "user-role-list": <UserRoleList />,
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
    // Iterate over menus to find the active one
    for (const menuItem of menus) {
      if (menuItem.subItems) {
        for (const subItem of menuItem.subItems) {
          // If the subItem's key matches the activePage, render its content
          if (subItem.key === activePage) {
            if (subItem.subItems) {
              // Set default tab if there is no activeTab
              if (!activeTab && subItem.subItems.length > 0) {
                setActiveTab(subItem.subItems[0].key);
              }

              return (
                <>
                  {renderTabs(subItem.subItems)}
                  <div>
                    {pages[activeTab] || (subItem.subItems.length > 0 && !pages[activeTab]
                      ? subItem.subItems[0].name // Show the name of the first subItem dynamically
                      : <div>Select a tab</div>)}
                  </div>
                </>
              );
            } else {
              // Handle case where there are no subItems
              return pages[activePage] || <div>No subItems available</div>;
            }
          }
        }
      } else {
        // If no subItems exist, handle items like 'FAQs', 'Logout', etc.
        if (menuItem.key === activePage) {
          return pages[activePage] || <div>Content not found</div>;
        }
      }
    }

    // Fallback when no menu item matches the activePage
    return <div>Select a menu item</div>;
  };

  useEffect(() => {
    // This ensures that whenever activePage changes, we update the activeTab to the first tab of the subItems.
    setActiveTab(null); // Reset the activeTab to make sure it updates based on the selected menu
  }, [activePage]);

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
