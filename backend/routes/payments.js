const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentDetails,
  getUserPayments,
} = require('../controllers/paymentController');

// Protected routes
router.post('/create-order', auth, createPaymentOrder);
router.post('/verify', auth, verifyPayment);
router.get('/user/payments', auth, getUserPayments);
router.get('/:paymentId', auth, getPaymentDetails);

module.exports = router;
