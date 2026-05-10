const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  createOrder,
  getOrderById,
  getUserOrders,
  getShopOrders,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');

// Protected routes
router.get('/user/orders', auth, authorize('customer'), getUserOrders);
router.get('/shop/orders', auth, authorize('shop_owner'), getShopOrders);
router.post('/', auth, authorize('customer'), createOrder);
router.get('/:id', auth, getOrderById);
router.put('/:id/status', auth, updateOrderStatus);
router.put('/:id/cancel', auth, cancelOrder);

module.exports = router;
