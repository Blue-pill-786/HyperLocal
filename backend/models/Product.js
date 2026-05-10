const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    category: String,
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: Number,
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [String],
    imageUrl: String,
    sku: String,
    prepTimeMinutes: {
      type: Number,
      default: 10,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
