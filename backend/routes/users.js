const express = require('express');
const User = require('../models/User');
const Shop = require('../models/Shop');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('favoriteShops', 'name category rating location');
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

router.post('/favorites/:shopId', auth, async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const user = await User.findById(req.user.id);
    const alreadySaved = user.favoriteShops.some((id) => id.toString() === shop._id.toString());

    if (alreadySaved) {
      user.favoriteShops = user.favoriteShops.filter((id) => id.toString() !== shop._id.toString());
    } else {
      user.favoriteShops.push(shop._id);
    }

    await user.save();
    res.json({
      success: true,
      message: alreadySaved ? 'Removed from favorites' : 'Added to favorites',
      data: user.favoriteShops,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
