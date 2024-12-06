const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createOrder,
  joinOrder,
  getOrderById,
  getMyOrders,
  generateReceipt,
  addOrderItems,
  updateOrderItems
} = require('../controllers/orderController');

// Create new order
router.post('/', protect, createOrder);

// Join existing order
router.post('/join', protect, joinOrder);

// Get all orders for current user
router.get('/user/myorders', protect, getMyOrders);

// Add items to order
router.post('/:orderId/items', protect, addOrderItems);

// Update items in order
router.put('/:orderId/items', protect, updateOrderItems);

// Get specific order
router.get('/:orderId', protect, getOrderById);

// Get receipt for specific order
router.get('/:orderId/receipt', protect, generateReceipt);

module.exports = router;
