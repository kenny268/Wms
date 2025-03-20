const receivingGoodsService = require('../services/receivingGoodsService');
const logger = require('../utils/logger');

const createReceipt = async (req, res) => {
    try {
        const result = await receivingGoodsService.createReceipt(req.body, req.user.UserId);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error('Error in createReceipt controller:', error);
        return res.status(500).json({ message: 'Failed to create receipt.', error: error.message });
    }
};

const addLineItemToReceipt = async (req, res) => {
    try {
        const result = await receivingGoodsService.addLineItemToReceipt(req.params.receiptId, req.body);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error('Error in addLineItemToReceipt controller:', error);
        return res.status(500).json({ message: 'Failed to add line item.', error: error.message });
    }
};

const receiveReceipt = async (req, res) => {
    try {
        const result = await receivingGoodsService.receiveReceipt(req.params.receiptId);
        return res.status(result.status).json({ message: result.message });
    } catch (error) {
        logger.error('Error in receiveReceipt controller:', error);
        return res.status(500).json({ message: 'Failed to receive receipt.', error: error.message });
    }
};

const getAllReceipts = async (req, res) => {
    try {
        const filters = {
            supplierId: req.query.supplierId,
            receiptDate: req.query.receiptDate,
            referenceNumber: req.query.referenceNumber,
            status: req.query.status,
        };
        const pagination = {
            page: req.query.page,
            limit: req.query.limit,
        };
        const result = await receivingGoodsService.getAllReceipts(filters, pagination);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error('Error in getAllReceipts controller:', error);
        return res.status(500).json({ message: 'Failed to retrieve receipts.', error: error.message });
    }
};

const getReceiptById = async (req, res) => {
    try {
        const result = await receivingGoodsService.getReceiptById(req.params.id);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error('Error in getReceiptById controller:', error);
        return res.status(500).json({ message: 'Failed to retrieve receipt.', error: error.message });
    }
};

const updateReceipt = async (req, res) => {
    try {
        const result = await receivingGoodsService.updateReceipt(req.params.id, req.body);
        return res.status(result.status).json(result.data || { message: result.message });
    } catch (error) {
        logger.error('Error in updateReceipt controller:', error);
        return res.status(500).json({ message: 'Failed to update receipt.', error: error.message });
    }
};

const cancelReceipt = async (req, res) => {
    try {
        const result = await receivingGoodsService.cancelReceipt(req.params.id);
        return res.status(result.status).json({ message: result.message });
    } catch (error) {
        logger.error('Error in cancelReceipt controller:', error);
        return res.status(500).json({ message: 'Failed to cancel receipt.', error: error.message });
    }
};

const deleteReceipt = async (req, res) => {
    try {
        const result = await receivingGoodsService.deleteReceipt(req.params.id);
        return res.status(result.status).send();
    } catch (error) {
        logger.error('Error in deleteReceipt controller:', error);
        return res.status(500).json({ message: 'Failed to delete receipt.', error: error.message });
    }
};

module.exports = {
    createReceipt,
    addLineItemToReceipt,
    receiveReceipt,
    getAllReceipts,
    getReceiptById,
    updateReceipt,
    cancelReceipt,
    deleteReceipt,
};