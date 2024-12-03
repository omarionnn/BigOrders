const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  notes: String
});

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['creator', 'participant'],
    default: 'participant'
  },
  items: [orderItemSchema]
});

const orderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  pin: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  items: [orderItemSchema],
  participants: [participantSchema],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate total amount before saving
orderSchema.pre('save', function(next) {
  const mainOrderTotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const participantTotal = this.participants.reduce((sum, participant) => {
    return sum + participant.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0);
  }, 0);
  
  this.totalAmount = mainOrderTotal + participantTotal;
  next();
});

module.exports = mongoose.model('Order', orderSchema);
