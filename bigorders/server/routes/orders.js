const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createOrder,
  joinOrder,
  getMyOrders,
  updateOrderItems,
  closeOrder,
  generateReceipt
} = require('../controllers/orderController');

// Create new order
router.post('/', protect, createOrder);

// Join existing order
router.post('/join', protect, joinOrder);

// Get user's orders
router.get('/myorders', protect, getMyOrders);

// Update order items
router.put('/:orderId/items', protect, updateOrderItems);

// Close order
router.put('/:orderId/close', protect, closeOrder);

// Generate receipt
router.get('/:orderId/receipt', protect, generateReceipt);

module.exports = router;
