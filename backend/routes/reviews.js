const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createProductReview,
  createShopReview,
  getProductReviews,
  getShopReviews,
  deleteReview,
} = require('../controllers/reviewController');

// Public routes
router.get('/product/:productId', getProductReviews);
router.get('/shop/:shopId', getShopReviews);

// Protected routes
router.post('/product', auth, createProductReview);
router.post('/shop', auth, createShopReview);
router.delete('/:id', auth, deleteReview);

module.exports = router;
