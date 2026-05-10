const Shop = require('../models/Shop');
const { isValidCoordinates } = require('../utils/validators');

// Create shop
exports.createShop = async (req, res) => {
  try {
    const { name, category, address, city, state, zipCode, latitude, longitude, contactNumber } = req.body;

    if (!name || !category || !latitude || !longitude || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (!isValidCoordinates(latitude, longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates',
      });
    }

    const shop = new Shop({
      owner: req.user.id,
      name,
      category,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        address,
        city,
        state,
        zipCode,
      },
      contactNumber,
    });

    await shop.save();

    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: shop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all shops with location filter
exports.getNearbyShops = async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 5, search, category } = req.query;

    if (!latitude || !longitude) {
      const filter = { isApproved: true, isActive: true };
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
        ];
      }
      if (category) filter.category = category;
      const shops = await Shop.find(filter).sort({ rating: -1, totalOrders: -1 }).limit(50);
      return res.json({ success: true, data: shops });
    }

    const filter = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseFloat(maxDistance) * 1000, // Convert km to meters
        },
      },
      isApproved: true,
      isActive: true,
    };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) filter.category = category;

    const shops = await Shop.find(filter);

    res.json({
      success: true,
      data: shops,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get shop by ID
exports.getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('owner', 'name email phone');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
    }

    res.json({
      success: true,
      data: shop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update shop
exports.updateShop = async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findById(id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
    }

    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this shop',
      });
    }

    Object.assign(shop, req.body);
    await shop.save();

    res.json({
      success: true,
      message: 'Shop updated successfully',
      data: shop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete shop
exports.deleteShop = async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findById(id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
    }

    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this shop',
      });
    }

    await Shop.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Shop deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get my shop (for shop owner)
exports.getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user.id });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
    }

    res.json({
      success: true,
      data: shop,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = exports;
