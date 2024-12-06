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
      email: req.user?.email
    });

    const { restaurantId, name } = req.body;

    // Validate required fields
    if (!restaurantId || !name) {
      console.log('4. Validation Failed:', { restaurantId, name });
      return res.status(400).json({
        success: false,
        message: 'Please provide both restaurant ID and order name'
      });
    }

    // Validate restaurant
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      console.log('5. Restaurant Not Found:', restaurantId);
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
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

    // Create order
    const order = await Order.create({
      name,
      restaurant: restaurantId,
      creator: req.user._id,
      pin,
      status: 'open',
      participants: [{
        user: req.user._id,
        role: 'creator',
        items: []
      }]
    });

    console.log('6. Order created:', {
      id: order._id,
      name: order.name,
      pin: order.pin
    });

    // Return populated order
    const populatedOrder = await Order.findById(order._id)
      .populate('creator', 'name email')
      .populate('restaurant', 'name cuisine description')
      .populate('participants.user', 'name email');

    return res.status(201).json({
      success: true,
      order: populatedOrder
    });

  } catch (error) {
    console.error('Order Creation Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// @desc    Join an order
// @route   POST /api/orders/join
// @access  Private
const joinOrder = asyncHandler(async (req, res) => {
  try {
    console.log('\n=== JOIN ORDER DEBUG ===');
    console.log('1. Request Headers:', {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      contentType: req.headers['content-type']
    });
    console.log('2. Request Body:', req.body);
    console.log('3. Authenticated User:', {
      id: req.user?._id,
      email: req.user?.email
    });

    const { pin } = req.body;

    if (!pin) {
      console.log('4. Error: No PIN provided');
      return res.status(400).json({
        success: false,
        message: 'Please provide a PIN'
      });
    }

    console.log('5. Looking for order with PIN:', pin);
    
    // Find order by PIN
    const order = await Order.findOne({ pin })
      .populate('creator', 'name email')
      .populate('restaurant', 'name cuisine description')
      .populate('participants.user', 'name email');

    console.log('6. Order found:', order ? {
      id: order._id,
      name: order.name,
      status: order.status,
      participantsCount: order.participants.length
    } : 'No order found');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'open') {
      console.log('7. Order status not open:', order.status);
      return res.status(400).json({
        success: false,
        message: 'This order is no longer accepting participants'
      });
    }

    // Check if user is already a participant
    const isParticipant = order.participants.some(
      p => p.user._id.toString() === req.user._id.toString()
    );

    console.log('8. Participation check:', {
      isParticipant,
      userId: req.user._id,
      participants: order.participants.map(p => ({
        id: p.user._id,
        role: p.role
      }))
    });

    if (isParticipant) {
      return res.status(400).json({
        success: false,
        message: 'You are already a participant in this order'
      });
    }

    // Add user as participant
    order.participants.push({
      user: req.user._id,
      role: 'participant',
      items: []
    });

    console.log('9. Adding user as participant');
    await order.save();

    // Return updated order
    const updatedOrder = await Order.findById(order._id)
      .populate('creator', 'name email')
      .populate('restaurant', 'name cuisine description')
      .populate('participants.user', 'name email');

    console.log('10. Successfully joined order');

    return res.json({
      success: true,
      order: updatedOrder
    });

  } catch (error) {
    console.error('Join Order Error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      message: 'Failed to join order',
      error: error.message
    });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('creator', 'name email')
    .populate('restaurant', 'name cuisine description')
    .populate('participants.user', 'name email');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  res.json({
    success: true,
    order
  });
});

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    $or: [
      { creator: req.user._id },
      { 'participants.user': req.user._id }
    ]
  })
    .populate('creator', 'name email')
    .populate('restaurant', 'name cuisine description')
    .populate('participants.user', 'name email')
    .sort('-createdAt');

  res.json({
    success: true,
    orders
  });
});

// @desc    Add items to order
// @route   POST /api/orders/:orderId/items
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  try {
    console.log('\n=== ADD ORDER ITEMS DEBUG ===');
    console.log('1. Order ID:', req.params.orderId);
    console.log('2. User ID:', req.user._id);
    console.log('3. Items to add:', req.body.items);

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Find the participant (either creator or participant)
    let participant = order.participants.find(p => 
      p.user.toString() === req.user._id.toString()
    );

    if (!participant) {
      if (order.creator.toString() === req.user._id.toString()) {
        // If user is creator but not in participants, add them
        participant = {
          user: req.user._id,
          role: 'creator',
          items: [],
          total: 0
        };
        order.participants.push(participant);
      } else {
        return res.status(403).json({
          success: false,
          message: 'User is not a participant in this order'
        });
      }
    }

    // Add the new items
    const newItems = req.body.items.map(item => ({
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      notes: item.notes || '',
      subtotal: Number(item.price) * Number(item.quantity)
    }));

    // Update participant's items
    participant.items = newItems;
    
    // Calculate participant's total
    participant.total = newItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Calculate order total
    order.total = order.participants.reduce((sum, p) => sum + p.total, 0);

    console.log('4. Updated participant:', {
      userId: participant.user,
      items: participant.items,
      total: participant.total
    });
    
    await order.save();

    res.json({
      success: true,
      message: 'Items added successfully',
      participant: {
        items: participant.items,
        total: participant.total
      }
    });
  } catch (error) {
    console.error('Error adding items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add items to order',
      error: error.message
    });
  }
});

// @desc    Update order items
// @route   PUT /api/orders/:orderId/items
// @access  Private
const updateOrderItems = asyncHandler(async (req, res) => {
  try {
    console.log('\n=== UPDATE ORDER ITEMS DEBUG (Server) ===');
    
    // 1. Log request details
    console.log('1. Request details:', {
      orderId: req.params.orderId,
      userId: req.user?._id,
      headers: {
        contentType: req.headers['content-type'],
        authorization: req.headers.authorization ? 'Present' : 'Missing'
      },
      body: {
        hasItems: !!req.body.items,
        itemCount: req.body.items?.length,
        isArray: Array.isArray(req.body.items)
      }
    });

    // 2. Validate request data
    if (!req.body.items || !Array.isArray(req.body.items)) {
      console.error('2. Invalid items data:', {
        body: req.body,
        items: req.body.items
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid items data. Expected an array of items.'
      });
    }

    // 3. Validate each item
    console.log('3. Validating items:', req.body.items);
    
    const validatedItems = req.body.items.map((item, index) => {
      console.log(`4. Processing item ${index + 1}:`, {
        raw: item,
        types: {
          id: typeof item.id,
          name: typeof item.name,
          price: typeof item.price,
          quantity: typeof item.quantity,
          notes: typeof item.notes,
          subtotal: typeof item.subtotal
        }
      });

      // Check required fields
      if (!item.id || !item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        console.error(`Invalid structure for item ${index + 1}:`, {
          item,
          validation: {
            hasId: !!item.id,
            hasName: !!item.name,
            priceType: typeof item.price,
            quantityType: typeof item.quantity
          }
        });
        throw new Error(`Invalid structure for item: ${item.name || 'Unknown item'}`);
      }

      // Validate price and quantity
      if (isNaN(item.price) || item.price <= 0) {
        console.error(`Invalid price for item ${index + 1}:`, {
          name: item.name,
          price: item.price
        });
        throw new Error(`Invalid price for item: ${item.name}`);
      }
      if (isNaN(item.quantity) || item.quantity <= 0) {
        console.error(`Invalid quantity for item ${index + 1}:`, {
          name: item.name,
          quantity: item.quantity
        });
        throw new Error(`Invalid quantity for item: ${item.name}`);
      }

      // Validate subtotal calculation
      const calculatedSubtotal = Math.round((item.price * item.quantity) * 100) / 100;
      if (Math.abs(calculatedSubtotal - item.subtotal) > 0.01) {
        console.error(`Subtotal mismatch for item ${index + 1}:`, {
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          calculated: calculatedSubtotal,
          received: item.subtotal
        });
        throw new Error(`Invalid subtotal for item: ${item.name}`);
      }

      const validatedItem = {
        id: item.id,
        name: item.name.trim(),
        price: item.price,
        quantity: item.quantity,
        notes: item.notes?.trim() || '',
        subtotal: calculatedSubtotal
      };

      console.log(`5. Validated item ${index + 1}:`, validatedItem);
      return validatedItem;
    });

    // 4. Find and validate order
    console.log('6. Finding order:', req.params.orderId);
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      console.error('7. Order not found:', {
        orderId: req.params.orderId,
        exists: !!order
      });
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('7. Order found:', {
      id: order._id,
      status: order.status,
      participantCount: order.participants.length
    });

    // 5. Find participant
    const participantIndex = order.participants.findIndex(
      p => p.user.toString() === req.user._id.toString()
    );

    console.log('8. Participant check:', {
      userId: req.user._id.toString(),
      participantIndex,
      isCreator: order.creator.toString() === req.user._id.toString(),
      participants: order.participants.map(p => ({
        id: p.user.toString(),
        role: p.role
      }))
    });

    // Handle non-participants
    if (participantIndex === -1) {
      if (order.creator.toString() === req.user._id.toString()) {
        console.log('9. Adding creator as participant');
        order.participants.push({
          user: req.user._id,
          role: 'creator',
          items: [],
          total: 0
        });
      } else {
        console.error('9. Unauthorized user:', {
          userId: req.user._id.toString(),
          orderId: order._id.toString()
        });
        return res.status(403).json({
          success: false,
          message: 'User is not a participant in this order'
        });
      }
    }

    // 6. Update participant's items
    const finalParticipantIndex = participantIndex === -1 ? order.participants.length - 1 : participantIndex;
    order.participants[finalParticipantIndex].items = validatedItems;
    
    // Calculate participant's total
    const participantTotal = validatedItems.reduce((sum, item) => sum + item.subtotal, 0);
    order.participants[finalParticipantIndex].total = Math.round(participantTotal * 100) / 100;

    // Calculate order total
    order.total = Math.round(
      order.participants.reduce((sum, p) => sum + (p.total || 0), 0) * 100
    ) / 100;

    console.log('10. Updated totals:', {
      participantItems: validatedItems.length,
      participantTotal: order.participants[finalParticipantIndex].total,
      orderTotal: order.total
    });

    // 7. Save changes
    try {
      await order.save();
      console.log('11. Order saved successfully');
    } catch (saveError) {
      console.error('Save error:', {
        message: saveError.message,
        stack: saveError.stack,
        validationErrors: saveError.errors
      });
      throw saveError;
    }

    return res.json({
      success: true,
      message: 'Items updated successfully',
      participant: {
        items: order.participants[finalParticipantIndex].items,
        total: order.participants[finalParticipantIndex].total
      },
      orderTotal: order.total
    });

  } catch (error) {
    console.error('Update Items Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    
    // Return appropriate error message
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update items',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @desc    Generate receipt
// @route   GET /api/orders/:orderId/receipt
// @access  Private
const generateReceipt = asyncHandler(async (req, res) => {
  try {
    console.log('\n=== GENERATE RECEIPT DEBUG (Server) ===');
    console.log('1. Request details:', {
      orderId: req.params.orderId,
      userId: req.user._id
    });
    
    const order = await Order.findById(req.params.orderId)
      .populate('creator', 'name email')
      .populate('restaurant', 'name cuisine description address')
      .populate('participants.user', 'name email');

    if (!order) {
      console.log('2. Order not found');
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('3. Found order:', {
      id: order._id,
      name: order.name,
      status: order.status,
      participantCount: order.participants.length,
      total: order.total
    });

    // Validate that the order has participants with items
    if (!order.participants || order.participants.length === 0) {
      console.log('4. No participants found in order');
      return res.status(400).json({
        success: false,
        message: 'No participants found in order'
      });
    }

    // Format participant data with items and totals
    const participants = order.participants.map((p, index) => {
      console.log(`5. Processing participant ${index + 1}:`, {
        name: p.user.name,
        role: p.role,
        itemCount: p.items?.length,
        total: p.total
      });

      // Validate and format items
      const formattedItems = (p.items || []).map(item => ({
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        notes: item.notes || '',
        subtotal: Number(item.subtotal)
      }));

      return {
        user: {
          _id: p.user._id,
          name: p.user.name,
          email: p.user.email
        },
        role: p.role,
        items: formattedItems,
        total: p.total
      };
    });

    // Format the receipt data
    const receipt = {
      order: {
        _id: order._id,
        name: order.name,
        status: order.status,
        pin: order.pin,
        total: order.total,
        createdAt: order.createdAt
      },
      restaurant: {
        _id: order.restaurant._id,
        name: order.restaurant.name,
        cuisine: order.restaurant.cuisine,
        description: order.restaurant.description,
        address: order.restaurant.address
      },
      creator: {
        _id: order.creator._id,
        name: order.creator.name,
        email: order.creator.email
      },
      participants: participants
    };

    console.log('6. Generated receipt:', {
      orderName: receipt.order.name,
      restaurantName: receipt.restaurant.name,
      participantCount: receipt.participants.length,
      total: receipt.order.total
    });

    return res.json({
      success: true,
      receipt
    });
  } catch (error) {
    console.error('Generate Receipt Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate receipt',
      error: error.message
    });
  }
});

module.exports = {
  createOrder,
  joinOrder,
  getOrderById,
  getMyOrders,
  generateReceipt,
  addOrderItems,
  updateOrderItems
};
