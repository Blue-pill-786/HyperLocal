const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet'],
      default: 'upi',
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    razorpayPaymentId: String,
    razorpayOrderId: String,
    status: {
      type: String,
      enum: ['pending', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentDetails: {
      email: String,
      phone: String,
      description: String,
    },
    refund: {
      status: {
        type: String,
        enum: ['none', 'partial', 'full'],
        default: 'none',
      },
      amount: {
        type: Number,
        default: 0,
      },
      reason: String,
      processedAt: Date,
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
