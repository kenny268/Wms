const { Inventory, Product, ProductLot, WarehouseLocation, StockMovement, StockTakeItem } = require('../models');
const { Op } = require('sequelize');

// --- CRUD Operations ---

// Create a new Inventory record
exports.createInventory = async (req, res) => {
    try {
        const { ProductLotID, LocationID, QuantityOnHand, QuantityAllocated, SerialNumber, LastStockTakeDate, Notes } = req.body;

        // Verify ProductLot and Location exist
        const productLotExists = await ProductLot.findByPk(ProductLotID);
        const locationExists = await WarehouseLocation.findByPk(LocationID);

        if (!productLotExists || !locationExists) {
            return res.status(400).json({ message: 'Invalid ProductLotID or LocationID' });
        }

        const newInventory = await Inventory.create({
            ProductLotID,
            LocationID,
            QuantityOnHand: QuantityOnHand || 0,
            QuantityAllocated: QuantityAllocated || 0,
            SerialNumber,
            LastStockTakeDate,
            Notes,
        });

        res.status(201).json(newInventory);
    } catch (error) {
        console.error('Error creating inventory:', error);
        res.status(500).json({ message: 'Failed to create inventory', error: error.message });
    }
};

// Get all Inventory records with associated details
exports.getAllInventory = async (req, res) => {
    try {
        const inventory = await Inventory.findAll({
            include: [
                { model: ProductLot, include: [Product] },
                WarehouseLocation,
            ],
        });
        res.status(200).json(inventory);
    } catch (error) {
        console.error('Error fetching all inventory:', error);
        res.status(500).json({ message: 'Failed to fetch inventory', error: error.message });
    }
};

// Get a specific Inventory record by ID with associated details
exports.getInventoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const inventory = await Inventory.findByPk(id, {
            include: [
                { model: ProductLot, include: [Product] },
                WarehouseLocation,
            ],
        });
        if (inventory) {
            res.status(200).json(inventory);
        } else {
            res.status(404).json({ message: 'Inventory record not found' });
        }
    } catch (error) {
        console.error('Error fetching inventory by ID:', error);
        res.status(500).json({ message: 'Failed to fetch inventory', error: error.message });
    }
};

// Update an existing Inventory record by ID
exports.updateInventory = async (req, res) => {
    const { id } = req.params;
    const { ProductLotID, LocationID, QuantityOnHand, QuantityAllocated, SerialNumber, LastStockTakeDate, Notes } = req.body;

    try {
        const inventory = await Inventory.findByPk(id);
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory record not found' });
        }

        // Validate ProductLot and Location if they are being updated
        if (ProductLotID) {
            const productLotExists = await ProductLot.findByPk(ProductLotID);
            if (!productLotExists) {
                return res.status(400).json({ message: 'Invalid ProductLotID' });
            }
            inventory.ProductLotID = ProductLotID;
        }
        if (LocationID) {
            const locationExists = await WarehouseLocation.findByPk(LocationID);
            if (!locationExists) {
                return res.status(400).json({ message: 'Invalid LocationID' });
            }
            inventory.LocationID = LocationID;
        }

        inventory.QuantityOnHand = QuantityOnHand !== undefined ? QuantityOnHand : inventory.QuantityOnHand;
        inventory.QuantityAllocated = QuantityAllocated !== undefined ? QuantityAllocated : inventory.QuantityAllocated;
        inventory.SerialNumber = SerialNumber !== undefined ? SerialNumber : inventory.SerialNumber;
        inventory.LastStockTakeDate = LastStockTakeDate !== undefined ? LastStockTakeDate : inventory.LastStockTakeDate;
        inventory.Notes = Notes !== undefined ? Notes : inventory.Notes;

        await inventory.save();

        const updatedInventory = await Inventory.findByPk(id, {
            include: [
                { model: ProductLot, include: [Product] },
                WarehouseLocation,
            ],
        });
        res.status(200).json(updatedInventory);
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ message: 'Failed to update inventory', error: error.message });
    }
};

// Delete an Inventory record by ID
exports.deleteInventory = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedRows = await Inventory.destroy({
            where: { InventoryID: id },
        });
        if (deletedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Inventory record not found' });
        }
    } catch (error) {
        console.error('Error deleting inventory:', error);
        res.status(500).json({ message: 'Failed to delete inventory', error: error.message });
    }
};

// --- Warehouse Management Task Logic ---

// Allocate Inventory for an Outbound Order Line Item
exports.allocateInventory = async (req, res) => {
    const { inventoryId, quantityToAllocate } = req.body;
    try {
        const inventory = await Inventory.findByPk(inventoryId);
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory record not found' });
        }

        if (inventory.QuantityOnHand < quantityToAllocate) {
            return res.status(400).json({ message: 'Insufficient quantity on hand to allocate' });
        }

        await inventory.increment('QuantityAllocated', { by: quantityToAllocate });
        res.status(200).json({ message: `Allocated ${quantityToAllocate} units from Inventory ID ${inventoryId}` });
    } catch (error) {
        console.error('Error allocating inventory:', error);
        res.status(500).json({ message: 'Failed to allocate inventory', error: error.message });
    }
};

// Deallocate Inventory (e.g., if an order is cancelled)
exports.deallocateInventory = async (req, res) => {
    const { inventoryId, quantityToDeallocate } = req.body;
    try {
        const inventory = await Inventory.findByPk(inventoryId);
        if (!inventory) {
            return res.status(404).json({ message: 'Inventory record not found' });
        }

        if (inventory.QuantityAllocated < quantityToDeallocate) {
            return res.status(400).json({ message: 'Cannot deallocate more than the allocated quantity' });
        }

        await inventory.decrement('QuantityAllocated', { by: quantityToDeallocate });
        res.status(200).json({ message: `Deallocated ${quantityToDeallocate} units from Inventory ID ${inventoryId}` });
    } catch (error) {
        console.error('Error deallocating inventory:', error);
        res.status(500).json({ message: 'Failed to deallocate inventory', error: error.message });
    }
};

// Move Inventory from one location to another
exports.moveInventory = async (req, res) => {
    const { inventoryId, newLocationId, quantityToMove, movedByUser } = req.body;
    try {
        const inventory = await Inventory.findByPk(inventoryId);
        const newLocation = await WarehouseLocation.findByPk(newLocationId);

        if (!inventory || !newLocation) {
            return res.status(404).json({ message: 'Inventory record or new location not found' });
        }

        if (inventory.QuantityOnHand < quantityToMove) {
            return res.status(400).json({ message: 'Insufficient quantity on hand to move' });
        }

        // Create a new inventory record at the new location
        const [newInventoryRecord] = await Inventory.findOrCreate({
            where: { ProductLotID: inventory.ProductLotID, LocationID: newLocationId, SerialNumber: inventory.SerialNumber },
            defaults: { QuantityOnHand: 0, QuantityAllocated: 0 },
        });

        await newInventoryRecord.increment('QuantityOnHand', { by: quantityToMove });

        // Decrement the quantity at the old location
        await inventory.decrement('QuantityOnHand', { by: quantityToMove });

        // Create a StockMovement record
        await StockMovement.create({
            MovementType: 'Transfer',
            ProductID: (await ProductLot.findByPk(inventory.ProductLotID)).ProductID,
            FromLocationID: inventory.LocationID,
            ToLocationID: newLocationId,
            Quantity: quantityToMove,
            UserID: movedByUser, // Assuming you pass the user ID
        });

        res.status(200).json({ message: `Moved ${quantityToMove} units to Location ID ${newLocationId}` });
    } catch (error) {
        console.error('Error moving inventory:', error);
        res.status(500).json({ message: 'Failed to move inventory', error: error.message });
    }
};

// Process a Stock Take Count and adjust inventory
exports.processStockTakeCount = async (req, res) => {
    const { stockTakeItemId, countedQuantity, countedByUser } = req.body;
    try {
        const stockTakeItem = await StockTakeItem.findByPk(stockTakeItemId, {
            include: [
                { model: Inventory },
                { model: ProductLot, include: [Product] },
                { model: WarehouseLocation },
            ],
        });

        if (!stockTakeItem) {
            return res.status(404).json({ message: 'Stock Take Item not found' });
        }

        const inventory = stockTakeItem.Inventory;
        const countedQty = parseInt(countedQuantity, 10);

        if (!inventory) {
            return res.status(400).json({ message: 'Inventory record associated with this Stock Take Item not found' });
        }

        const discrepancy = countedQty - inventory.QuantityOnHand;

        if (discrepancy !== 0) {
            // Adjust the inventory quantity
            inventory.QuantityOnHand = countedQty;
            await inventory.save();

            // Create a StockMovement record for the adjustment
            await StockMovement.create({
                MovementType: 'Adjustment',
                ProductID: stockTakeItem.ProductLot.Product.ProductID,
                FromLocationID: discrepancy < 0 ? inventory.LocationID : null,
                ToLocationID: discrepancy > 0 ? inventory.LocationID : null,
                Quantity: Math.abs(discrepancy),
                Reason: `Stock Take Adjustment (StockTakeItem ID: ${stockTakeItemId})`,
                UserID: countedByUser, // Assuming you pass the user ID
            });

            // Update the StockTakeItem with the counted quantity and link to the adjustment movement
            stockTakeItem.CountedQuantity = countedQty;
            stockTakeItem.AdjustmentStockMovementID = (await StockMovement.findOne({ where: { Reason: `Stock Take Adjustment (StockTakeItem ID: ${stockTakeItemId})` }, order: [['StockMovementID', 'DESC']] })).StockMovementID;
            await stockTakeItem.save();
        } else {
            // If no discrepancy, just update the counted quantity
            stockTakeItem.CountedQuantity = countedQty;
            await stockTakeItem.save();
        }

        res.status(200).json({ message: `Stock take count processed for Item ID ${stockTakeItemId}, inventory adjusted by ${discrepancy}` });
    } catch (error) {
        console.error('Error processing stock take count:', error);
        res.status(500).json({ message: 'Failed to process stock take count', error: error.message });
    }
};

// Get Inventory based on various filters (e.g., by Product, Location, Lot Number)
exports.getInventoryByFilters = async (req, res) => {
    const { productId, locationId, lotNumber } = req.query;
    const whereClause = {};

    if (productId) {
        const productLots = await ProductLot.findAll({ where: { ProductID: productId }, attributes: ['ProductLotID'] });
        whereClause.ProductLotID = { [Op.in]: productLots.map(lot => lot.ProductLotID) };
    }
    if (locationId) {
        whereClause.LocationID = locationId;
    }
    if (lotNumber) {
        const productLot = await ProductLot.findOne({ where: { LotNumber: lotNumber, ProductID: productId } });
        if (productLot) {
            whereClause.ProductLotID = productLot.ProductLotID;
        } else {
            return res.status(404).json({ message: 'ProductLot not found with the given Lot Number and Product ID' });
        }
    }

    try {
        const inventory = await Inventory.findAll({
            where: whereClause,
            include: [
                { model: ProductLot, include: [Product] },
                WarehouseLocation,
            ],
        });
        res.status(200).json(inventory);
    } catch (error) {
        console.error('Error fetching inventory by filters:', error);
        res.status(500).json({ message: 'Failed to fetch inventory', error: error.message });
    }
};