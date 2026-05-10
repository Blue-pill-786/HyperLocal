const Product = require('../models/Product');
const Shop = require('../models/Shop');

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, price, stock, category, description, images, imageUrl, originalPrice, prepTimeMinutes } = req.body;
    const { shopId } = req.params;

    if (!name || !price || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, and stock',
      });
    }

    // Check if shop exists and belongs to user
    const shop = await Shop.findById(shopId);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found',
      });
    }

    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to add products to this shop',
      });
    }

    const product = new Product({
      shop: shopId,
      name,
      price,
      stock,
      category,
      description,
      images: images || (imageUrl ? [imageUrl] : []),
      imageUrl,
      originalPrice,
      prepTimeMinutes,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get products by shop
exports.getProductsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    const products = await Product.find({ shop: shopId, isAvailable: true });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('shop', 'name location');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const shop = await Shop.findById(product.shop);

    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this product',
      });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const shop = await Shop.findById(product.shop);

    if (shop.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this product',
      });
    }

    await Product.deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { query, category } = req.query;

    let filter = { isAvailable: true };

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter).populate('shop', 'name location');

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = exports;
