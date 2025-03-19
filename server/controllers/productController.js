const productService = require('../services/productService');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Middleware to handle validation results
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const createProduct = async (req, res) => {
    try {
        const newProduct = await productService.createProduct(req.body);
        return res.status(201).json(newProduct);
    } catch (error) {
        logger.error(`Error creating product: ${error.message}`, { body: req.body });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const filters = {
            category: req.query.category,
            productCode: req.query.productCode,
            productName: req.query.productName,
        };
        const pagination = {
            page: req.query.page || 1,
            limit: req.query.limit || 20,
        };
        const { count, rows } = await productService.getAllProducts(filters, pagination);
        return res.status(200).json({ count, rows });
    } catch (error) {
        logger.error(`Error retrieving products: ${error.message}`, { query: req.query });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: `Product with ID ${req.params.id} not found.` });
        }
        return res.status(200).json(product);
    } catch (error) {
        logger.error(`Error retrieving product by ID: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await productService.updateProduct(req.params.id, req.body);
        if (!updatedProduct) {
            return res.status(404).json({ message: `Product with ID ${req.params.id} not found.` });
        }
        return res.status(200).json(updatedProduct);
    } catch (error) {
        logger.error(`Error updating product: ${error.message}`, { params: req.params, body: req.body });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const isDeleted = await productService.deleteProduct(req.params.id);
        if (!isDeleted) {
            return res.status(404).json({ message: `Product with ID ${req.params.id} not found.` });
        }
        return res.status(204).send();
    } catch (error) {
        logger.error(`Error deleting product: ${error.message}`, { params: req.params });
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

module.exports = {
    handleValidationErrors,
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};