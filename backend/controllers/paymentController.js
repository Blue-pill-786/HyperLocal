const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const config = require('../config/env');
const crypto = require('crypto');

const getRazorpay = () => {
  if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys are missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }

  return new Razorpay({
    key_id: config.RAZORPAY_KEY_ID,
    key_secret: config.RAZORPAY_KEY_SECRET,
  });
};

// Create payment order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order payment already processed',
      });
    }

    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalAmount * 100), // Amount in paise
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        orderId: order._id.toString(),
        userId: order.buyer.toString(),
      },
    });

    // Save payment record
    const payment = new Payment({
      orderId: order._id,
      userId: order.buyer,
      shopId: order.shop,
      amount: order.totalAmount,
      razorpayOrderId: razorpayOrder.id,
      status: 'pending',
      paymentDetails: {
        description: `Payment for Order ${order.orderNumber}`,
      },
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Payment order created',
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: order.totalAmount,
        currency: 'INR',
        paymentId: payment._id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + '|' + razorpayPaymentId)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    // Update payment record
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        razorpayPaymentId,
        status: 'captured',
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    // Update order payment status
    const order = await Order.findByIdAndUpdate(
      payment.orderId,
      {
        paymentStatus: 'completed',
        paymentId: razorpayPaymentId,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId: order._id,
        paymentStatus: 'completed',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('orderId', 'orderNumber totalAmount')
      .populate('userId', 'name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user payments
exports.getUserPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .populate('orderId', 'orderNumber totalAmount')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = exports;
