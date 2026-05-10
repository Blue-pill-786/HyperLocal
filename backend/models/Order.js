const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'wallet', 'cash'],
      default: 'upi',
    },
    paymentId: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'preparing', 'ready_for_pickup', 'completed', 'cancelled'],
      default: 'pending',
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'preparing', 'ready_for_pickup', 'completed', 'cancelled'],
      default: 'pending',
    },
    pickupCode: String,
    estimatedPreparationTime: {
      type: Number,
      default: 15,
    },
    couponCode: String,
    discountAmount: {
      type: Number,
      default: 0,
    },
    specialInstructions: String,
    readyAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
    notes: [
      {
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Generate unique order number
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
      const count = await mongoose.model('Order').countDocuments();
      this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
    }
    if (!this.pickupCode) {
      this.pickupCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    }
    this.status = this.orderStatus;
    next();
  });

module.exports = mongoose.model('Order', orderSchema);
