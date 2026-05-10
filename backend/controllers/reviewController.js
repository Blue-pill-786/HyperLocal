const Review = require('../models/Review');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const Order = require('../models/Order');

// Create review for product
exports.createProductReview = async (req, res) => {
  try {
    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and rating are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user has purchased this product
    const order = await Order.findOne({
      buyer: req.user.id,
      'items.product': productId,
    });

    const review = new Review({
      reviewer: req.user.id,
      product: productId,
      rating,
      title,
      comment,
      isVerifiedPurchase: !!order,
    });

    await review.save();

    // Update product rating
    const reviews = await Review.find({ product: productId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.updateOne(
      { _id: productId },
      {
        rating: avgRating,
        totalReviews: reviews.length,
      }
    );

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create review for shop
exports.createShopReview = async (req, res) => {
  try {
    const { shopId, rating, title, comment } = req.body;

    if (!shopId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Shop ID and rating are required',
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Check if shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
    }

    // Check if user has ordered from this shop
    const order = await Order.findOne({
      buyer: req.user.id,
      shop: shopId,
    });

    const review = new Review({
      reviewer: req.user.id,
      shop: shopId,
      rating,
      title,
      comment,
      isVerifiedPurchase: !!order,
    });

    await review.save();

    // Update shop rating
    const reviews = await Review.find({ shop: shopId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Shop.updateOne(
      { _id: shopId },
      {
        rating: avgRating,
        totalReviews: reviews.length,
      }
    );

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get product reviews
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate('reviewer', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get shop reviews
exports.getShopReviews = async (req, res) => {
  try {
    const { shopId } = req.params;

    const reviews = await Review.find({ shop: shopId })
      .populate('reviewer', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review',
      });
    }

    const productId = review.product;
    const shopId = review.shop;

    await Review.deleteOne({ _id: id });

    // Update ratings
    if (productId) {
      const reviews = await Review.find({ product: productId });
      const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

      await Product.updateOne(
        { _id: productId },
        {
          rating: avgRating,
          totalReviews: reviews.length,
        }
      );
    }

    if (shopId) {
      const reviews = await Review.find({ shop: shopId });
      const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

      await Shop.updateOne(
        { _id: shopId },
        {
          rating: avgRating,
          totalReviews: reviews.length,
        }
      );
    }

    res.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = exports;
