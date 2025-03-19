const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const {
    validateCreateProduct,
    validateGetAllProducts,
    validateGetProductById,
    validateUpdateProduct,
    validateDeleteProduct,
} = require('../validations/productValidators');
const {
    handleValidationErrors,
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');

// Create a new product
router.post('/api/products', authenticateToken, authorizeRole(['admin', 'warehouse']), validateCreateProduct, handleValidationErrors, createProduct);

// Get all products with optional filtering and pagination
router.get('/api/products', authenticateToken, authorizeRole(['viewer', 'admin', 'warehouse']), validateGetAllProducts, handleValidationErrors, getAllProducts);

// Get a specific product by ID
router.get('/api/products/:id', authenticateToken, authorizeRole(['viewer', 'admin', 'warehouse']), validateGetProductById, handleValidationErrors, getProductById);

// Update an existing product
router.put('/api/products/:id', authenticateToken, authorizeRole(['admin', 'warehouse']), validateUpdateProduct, handleValidationErrors, updateProduct);

// Delete a product
router.delete('/api/products/:id', authenticateToken, authorizeRole(['admin']), validateDeleteProduct, handleValidationErrors, deleteProduct);

module.exports = router;