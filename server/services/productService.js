const { Product, ProductCategory, UnitOfMeasure } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const productService = {
    async createProduct(productData) {
        try {
            const { ProductCategoryID, UOMID, ...details } = productData;
            const newProduct = await Product.create({
                ...details,
                CategoryID: ProductCategoryID, // Map to the correct foreign key
                UOMID: UOMID,
            });
            logger.info(`Product created with ID: ${newProduct.ProductID}`);
            return await Product.findByPk(newProduct.ProductID, { include: [ProductCategory, UnitOfMeasure] });
        } catch (error) {
            logger.error(`Error creating product: ${error.message}`, { productData });
            throw error;
        }
    },

    async getAllProducts(filters, pagination) {
        try {
            const { category, productCode, productName } = filters;
            const { page, limit } = pagination;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};
            const include = [UnitOfMeasure];

            if (category) {
                include.push({
                    model: ProductCategory,
                    where: { CategoryName: { [Op.iLike]: `%${category}%` } },
                    required: true, // Only include products that belong to the specified category
                });
            } else {
                include.push(ProductCategory); // Include even if no category filter
            }

            if (productCode) where.ProductCode = { [Op.iLike]: `%${productCode}%` };
            if (productName) where.ProductName = { [Op.iLike]: `%${productName}%` };

            const { count, rows } = await Product.findAndCountAll({
                where,
                include,
                offset,
                limit,
                order: [['ProductName', 'ASC']],
            });

            return { count, rows };
        } catch (error) {
            logger.error(`Error retrieving products: ${error.message}`, { filters, pagination });
            throw error;
        }
    },

    async getProductById(id) {
        try {
            const product = await Product.findByPk(id, { include: [ProductCategory, UnitOfMeasure] });
            return product;
        } catch (error) {
            logger.error(`Error retrieving product with ID ${id}: ${error.message}`);
            throw error;
        }
    },

    async updateProduct(id, updateData) {
        try {
            const { ProductCategoryID, UOMID, ...details } = updateData;
            const updatePayload = {
                ...details,
                CategoryID: ProductCategoryID, // Map to the correct foreign key
                UOMID: UOMID,
            };
            const [updatedRows] = await Product.update(updatePayload, {
                where: { ProductID: id },
            });
            if (updatedRows > 0) {
                logger.info(`Product with ID ${id} updated.`);
                return await Product.findByPk(id, { include: [ProductCategory, UnitOfMeasure] });
            }
            return null; // Product not found
        } catch (error) {
            logger.error(`Error updating product with ID ${id}: ${error.message}`, { updateData });
            throw error;
        }
    },

    async deleteProduct(id) {
        try {
            const deletedRows = await Product.destroy({
                where: { ProductID: id },
            });
            if (deletedRows > 0) {
                logger.info(`Product with ID ${id} deleted.`);
                return true;
            }
            return false; // Product not found
        } catch (error) {
            logger.error(`Error deleting product with ID ${id}: ${error.message}`);
            throw error;
        }
    },
};

module.exports = productService;