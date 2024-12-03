const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Create a new order
router.post('/', protect, orderController.createOrder);

// Join an existing order
router.post('/join', protect, orderController.joinOrder);

// Get order details
router.get('/:orderId', protect, orderController.getOrder);

// Update order items
router.put('/:orderId/items', protect, orderController.updateOrderItems);

// Generate receipt
router.get('/:orderId/receipt', protect, orderController.generateReceipt);

// Update order status
router.put('/:orderId/status', protect, orderController.updateOrderStatus);

// Get all orders for a user
router.get('/user/orders', protect, orderController.getUserOrders);

module.exports = router;
