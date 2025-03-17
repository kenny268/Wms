const Supplier = require('../models/Supplier'); // Import the Supplier model

// Create a new Supplier
exports.createSupplierWithAddress = async (req, res) => {
    try {
        const {
            CompanyName,
            ContactName,
            ContactTitle,
            Phone,
            Fax,
            Email,
            HomePage,
            AddressLine1,
            AddressLine2,
            City,
            StateProvince,
            PostalCode,
            Country,
            AddressType
        } = req.body;

        // 1. First create the Address
        const newAddress = await Address.create({
            AddressLine1,
            AddressLine2,
            City,
            StateProvince,
            PostalCode,
            Country,
            AddressType
        });

        // 2. Create the Supplier and associate it with the newly created Address
        const newSupplier = await Supplier.create({
            CompanyName,
            ContactName,
            ContactTitle,
            Phone,
            Fax,
            Email,
            HomePage,
            AddressID: newAddress.AddressID  // Link the Supplier to the Address
        });

        // 3. Return the new supplier with the associated address
        return res.status(201).json({
            supplier: newSupplier,
            address: newAddress
        });

    } catch (error) {
        console.error('Error creating supplier with address:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get all suppliers
exports.getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.findAll();
        return res.status(200).json(suppliers);
    } catch (error) {
        console.error("Error fetching suppliers: ", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get a single supplier by ID
exports.getSupplierById = async (req, res) => {
    const { id } = req.params;
    
    try {
        const supplier = await Supplier.findByPk(id);
        
        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }

        return res.status(200).json(supplier);
    } catch (error) {
        console.error("Error fetching supplier: ", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update an existing supplier
exports.updateSupplier = async (req, res) => {
    const { id } = req.params;
    const { CompanyName, ContactName, ContactTitle, Phone, Fax, Email, HomePage, AddressID } = req.body;

    try {
        const supplier = await Supplier.findByPk(id);
        
        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }

        // Update supplier details
        supplier.CompanyName = CompanyName || supplier.CompanyName;
        supplier.ContactName = ContactName || supplier.ContactName;
        supplier.ContactTitle = ContactTitle || supplier.ContactTitle;
        supplier.Phone = Phone || supplier.Phone;
        supplier.Fax = Fax || supplier.Fax;
        supplier.Email = Email || supplier.Email;
        supplier.HomePage = HomePage || supplier.HomePage;
        supplier.AddressID = AddressID || supplier.AddressID;

        await supplier.save(); // Save the updated supplier

        return res.status(200).json(supplier);
    } catch (error) {
        console.error("Error updating supplier: ", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Delete a supplier
exports.deleteSupplier = async (req, res) => {
    const { id } = req.params;
    
    try {
        const supplier = await Supplier.findByPk(id);

        if (!supplier) {
            return res.status(404).json({ message: "Supplier not found" });
        }

        await supplier.destroy(); // Delete the supplier
        return res.status(204).json(); // Respond with no content after deletion
    } catch (error) {
        console.error("Error deleting supplier: ", error);
        return res.status(500).json({ message: "Server error" });
    }
};
