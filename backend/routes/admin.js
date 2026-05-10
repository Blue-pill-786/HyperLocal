const express = require('express');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(auth, authorize('admin'));

router.get('/overview', async (req, res, next) => {
  try {
    const [users, shops, orders, payments, revenue] = await Promise.all([
      User.countDocuments(),
      Shop.countDocuments(),
      Order.countDocuments(),
      Payment.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        users,
        shops,
        orders,
        payments,
        revenue: revenue[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

router.get('/shops', async (req, res, next) => {
  try {
    const shops = await Shop.find().populate('owner', 'name email phone').sort({ createdAt: -1 });
    res.json({ success: true, data: shops });
  } catch (error) {
    next(error);
  }
});

router.patch('/shops/:id/approval', async (req, res, next) => {
  try {
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { isApproved: req.body.isApproved },
      { new: true }
    );
    if (!shop) return res.status(404).json({ success: false, message: 'Shop not found' });
    res.json({ success: true, data: shop });
  } catch (error) {
    next(error);
  }
});

router.get('/transactions', async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('orderId', 'orderNumber totalAmount')
      .populate('userId', 'name email')
      .populate('shopId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
