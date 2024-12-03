const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  try {
    console.log('\n=== ORDER CREATION DEBUG ===');
    console.log('1. Request Headers:', {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      contentType: req.headers['content-type']
    });
    
    console.log('2. Request Body:', req.body);
    console.log('3. Authenticated User:', {
      id: req.user?._id,
      email: req.user?.email,
      fullUser: req.user
    });

    const { restaurantId, name } = req.body;

    // Validate required fields
    if (!restaurantId || !name) {
      console.log('4. Validation Failed:', { restaurantId, name });
      return res.status(400).json({
        success: false,
        message: 'Please provide both restaurant ID and order name',
        received: { restaurantId, name }
      });
    }

    // Validate user authentication
    if (!req.user || !req.user._id) {
      console.log('5. Authentication Failed:', { user: req.user });
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or invalid user data'
      });
    }

    // Validate restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      console.log('6. Restaurant Not Found:', restaurantId);
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
        restaurantId
      });
    }

    // Generate PIN
    const generatePin = () => Math.floor(100000 + Math.random() * 900000).toString();
    let pin = generatePin();
    let pinExists = await Order.findOne({ pin });
    while (pinExists) {
      pin = generatePin();
      pinExists = await Order.findOne({ pin });
    }

    // Prepare order data
    const orderData = {
      name,
      restaurant: restaurantId,
      user: req.user._id,
      pin,
      status: 'pending',
      participants: [{
        user: req.user._id,
        role: 'creator',
        items: []
      }]
    };

    console.log('7. Creating order with data:', orderData);

    // Create order
    const order = await Order.create(orderData);
    console.log('8. Order created successfully:', {
      id: order._id,
      name: order.name,
      user: order.user,
      status: order.status
    });

    // Return success response
    return res.status(201).json({
      success: true,
      order: {
        _id: order._id,
        name: order.name,
        pin: order.pin,
        status: order.status,
        restaurant: order.restaurant,
        user: order.user,
        participants: order.participants,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('ERROR in createOrder:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Check for specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        field: error.path
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while creating order',
      error: error.message
    });
  }
});

// @desc    Join an existing order
// @route   POST /api/orders/join
// @access  Private
const joinOrder = asyncHandler(async (req, res) => {
  const { pin } = req.body;

  if (!pin) {
    res.status(400);
    throw new Error('Please provide the order PIN');
  }

  const order = await Order.findOne({ pin }).populate([
    { path: 'creator', select: 'name email' },
    { path: 'restaurant', select: 'name cuisine description' }
  ]);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user is already a participant
  const isParticipant = order.participants.some(
    p => p.user.toString() === req.user.id
  );

  if (isParticipant) {
    res.status(400);
    throw new Error('You are already part of this order');
  }

  // Add user as participant
  order.participants.push({
    user: req.user.id,
    role: 'participant',
    items: []
  });

  await order.save();

  res.json({
    success: true,
    order: {
      _id: order._id,
      name: order.name,
      pin: order.pin,
      status: order.status,
      restaurant: order.restaurant,
      creator: order.creator,
      participants: order.participants,
      createdAt: order.createdAt
    }
  });
});

// @desc    Get all orders for current user
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    'participants.user': req.user.id
  }).populate([
    { path: 'creator', select: 'name email' },
    { path: 'restaurant', select: 'name cuisine description' }
  ]);

  res.json({
    success: true,
    orders
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate([
    { path: 'creator', select: 'name email' },
    { path: 'restaurant', select: 'name cuisine description' }
  ]);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user is a participant
  const isParticipant = order.participants.some(
    p => p.user.toString() === req.user.id
  );

  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({
    success: true,
    order
  });
});

// @desc    Get order details
// @route   GET /api/orders/:orderId
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId)
    .populate('restaurant')
    .populate('user', 'name email')
    .populate('participants.user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  res.json(order);
});

// @desc    Update order items
// @route   PUT /api/orders/:orderId/items
// @access  Private
const updateOrderItems = asyncHandler(async (req, res) => {
  const { items } = req.body;
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user is part of the order
  const isParticipant = order.participants.some(p => p.user.toString() === req.user.id);
  if (order.user.toString() !== req.user.id && !isParticipant) {
    res.status(403);
    throw new Error('Not authorized to update this order');
  }

  if (order.user.toString() === req.user.id) {
    order.items = items;
  } else {
    const participantIndex = order.participants.findIndex(p => p.user.toString() === req.user.id);
    order.participants[participantIndex].items = items;
  }

  await order.save();
  res.json(order);
});

// @desc    Generate receipt
// @route   GET /api/orders/:orderId/receipt
// @access  Private
const generateReceipt = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId)
    .populate('restaurant')
    .populate('user', 'name email')
    .populate('participants.user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Calculate totals
  const mainOrderTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const participantTotals = order.participants.map(p => ({
    user: p.user,
    total: p.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }));

  const receipt = {
    orderId: order._id,
    restaurant: order.restaurant.name,
    mainOrder: {
      user: order.user,
      items: order.items,
      total: mainOrderTotal
    },
    participants: participantTotals,
    grandTotal: mainOrderTotal + participantTotals.reduce((sum, p) => sum + p.total, 0),
    generatedAt: new Date()
  };

  res.json(receipt);
});

// @desc    Update order status
// @route   PUT /api/orders/:orderId/status
// @access  Private
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Only order creator can update status');
  }

  order.status = status;
  await order.save();
  res.json(order);
});

// @desc    Get all orders for a user
// @route   GET /api/orders/user/orders
// @access  Private
const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    $or: [
      { user: req.user.id },
      { 'participants.user': req.user.id }
    ]
  })
    .populate('restaurant')
    .populate('user', 'name email')
    .populate('participants.user', 'name email')
    .sort('-createdAt');

  res.json(orders);
});

module.exports = {
  createOrder,
  joinOrder,
  getOrders,
  getOrderById,
  getOrder,
  updateOrderItems,
  generateReceipt,
  updateOrderStatus,
  getUserOrders
};
