const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  createShop,
  getNearbyShops,
  getShopById,
  updateShop,
  deleteShop,
  getMyShop,
} = require('../controllers/shopController');

// Public routes
router.get('/nearby', getNearbyShops);
router.get('/:id', getShopById);

// Protected routes
router.post('/', auth, authorize('shop_owner', 'admin'), createShop);
router.get('/owner/my-shop', auth, authorize('shop_owner'), getMyShop);
router.put('/:id', auth, updateShop);
router.delete('/:id', auth, deleteShop);

module.exports = router;
