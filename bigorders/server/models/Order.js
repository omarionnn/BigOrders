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
  notes: String,
  subtotal: {
    type: Number,
    default: function() {
      return Number(this.price) * Number(this.quantity);
    }
  }
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
  items: [orderItemSchema],
  total: {
    type: Number,
    default: 0
  }
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
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'active', 'completed', 'cancelled'],
    default: 'open'
  },
  participants: [participantSchema],
  total: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for getting all users in the order
orderSchema.virtual('users').get(function() {
  return [this.creator, ...this.participants.map(p => p.user)];
});

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
  // Calculate subtotals for each item
  this.participants.forEach(participant => {
    participant.items.forEach(item => {
      item.subtotal = Number(item.price) * Number(item.quantity);
    });
    
    // Calculate participant total
    participant.total = participant.items.reduce((sum, item) => sum + item.subtotal, 0);
  });
  
  // Calculate order total
  this.total = this.participants.reduce((sum, participant) => sum + participant.total, 0);
  
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
