const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  createProduct,
  getProductsByShop,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
} = require('../controllers/productController');

// Public routes
router.get('/shop/:shopId', getProductsByShop);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Protected routes
router.post('/shop/:shopId', auth, authorize('shop_owner', 'admin'), createProduct);
router.put('/:id', auth, updateProduct);
router.delete('/:id', auth, deleteProduct);

module.exports = router;
