const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Order = require('../models/Order');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hyperlocal');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Shop.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const users = await User.create([
      {
        name: 'John Customer',
        email: 'customer@example.com',
        phone: '9876543210',
        password: 'password123',
        role: 'customer',
      },
      {
        name: 'Sarah Shop Owner',
        email: 'shopowner@example.com',
        phone: '9876543211',
        password: 'password123',
        role: 'shop_owner',
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '9876543212',
        password: 'password123',
        role: 'admin',
      },
      {
        name: 'Mike Customer',
        email: 'mike@example.com',
        phone: '9876543213',
        password: 'password123',
        role: 'customer',
      },
      {
        name: 'Priya Shop Owner',
        email: 'priya@example.com',
        phone: '9876543214',
        password: 'password123',
        role: 'shop_owner',
      },
    ]);
    console.log(`Created ${users.length} users`);

    // Create sample shops
    const shops = await Shop.create([
      {
        owner: users[1]._id,
        name: 'Fresh Groceries',
        description: 'Fresh vegetables and daily essentials',
        category: 'grocery',
        location: {
          type: 'Point',
          coordinates: [77.1025, 28.7041],
          address: '123 Main Street',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
        },
        contactNumber: '9876543211',
        email: 'freshgroceries@example.com',
        rating: 4.5,
        totalReviews: 25,
        isApproved: true,
        isActive: true,
        operatingHours: { open: '08:00', close: '22:00' },
      },
      {
        owner: users[4]._id,
        name: 'Quick Meals Cafe',
        description: 'Fast food and snacks',
        category: 'food',
        location: {
          type: 'Point',
          coordinates: [77.105, 28.705],
          address: '456 Park Avenue',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110002',
        },
        contactNumber: '9876543214',
        email: 'quickmeals@example.com',
        rating: 4.2,
        totalReviews: 18,
        isApproved: true,
        isActive: true,
        operatingHours: { open: '07:00', close: '23:00' },
      },
      {
        owner: users[1]._id,
        name: 'Health Pharmacy',
        description: 'Medicines and health products',
        category: 'pharmacy',
        location: {
          type: 'Point',
          coordinates: [77.095, 28.695],
          address: '789 Health Road',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110003',
        },
        contactNumber: '9876543215',
        email: 'healthpharmacy@example.com',
        rating: 4.7,
        totalReviews: 32,
        isApproved: true,
        isActive: true,
        operatingHours: { open: '09:00', close: '21:00' },
      },
    ]);
    console.log(`Created ${shops.length} shops`);

    // Create sample products
    const products = await Product.create([
      // Fresh Groceries products
      {
        shop: shops[0]._id,
        name: 'Organic Tomatoes',
        description: 'Fresh organic tomatoes',
        category: 'vegetables',
        price: 40,
        originalPrice: 50,
        stock: 100,
        images: ['https://via.placeholder.com/300?text=Tomatoes'],
        isAvailable: true,
        rating: 4.3,
        totalReviews: 12,
      },
      {
        shop: shops[0]._id,
        name: 'Full Cream Milk',
        description: 'Fresh full cream milk - 1L',
        category: 'dairy',
        price: 65,
        stock: 50,
        images: ['https://via.placeholder.com/300?text=Milk'],
        isAvailable: true,
        rating: 4.6,
        totalReviews: 25,
      },
      {
        shop: shops[0]._id,
        name: 'Basmati Rice',
        description: 'Premium basmati rice - 1kg',
        category: 'grains',
        price: 250,
        originalPrice: 300,
        stock: 30,
        images: ['https://via.placeholder.com/300?text=Rice'],
        isAvailable: true,
        rating: 4.4,
        totalReviews: 8,
      },
      // Quick Meals products
      {
        shop: shops[1]._id,
        name: 'Chicken Biryani',
        description: 'Delicious chicken biryani',
        category: 'meal',
        price: 250,
        stock: 20,
        images: ['https://via.placeholder.com/300?text=Biryani'],
        isAvailable: true,
        rating: 4.5,
        totalReviews: 18,
      },
      {
        shop: shops[1]._id,
        name: 'Coke 250ml',
        description: 'Coca Cola bottle',
        category: 'beverages',
        price: 40,
        stock: 100,
        images: ['https://via.placeholder.com/300?text=Coke'],
        isAvailable: true,
        rating: 4.0,
        totalReviews: 15,
      },
      // Health Pharmacy products
      {
        shop: shops[2]._id,
        name: 'Aspirin',
        description: 'Aspirin 500mg - 10 tablets',
        category: 'medicine',
        price: 25,
        stock: 200,
        images: ['https://via.placeholder.com/300?text=Aspirin'],
        isAvailable: true,
        rating: 4.7,
        totalReviews: 20,
      },
    ]);
    console.log(`Created ${products.length} products`);

    // Update shop product counts
    for (const shop of shops) {
      const productCount = await Product.countDocuments({ shop: shop._id });
      shop.totalOrders = Math.floor(Math.random() * 50) + 10;
      shop.totalRevenue = Math.floor(Math.random() * 50000) + 5000;
      await shop.save();
    }

    // Create sample orders
    const orders = await Order.create([
      {
        orderNumber: `ORD-${Date.now()}-1`,
        buyer: users[0]._id,
        shop: shops[0]._id,
        items: [
          {
            product: products[0]._id,
            quantity: 2,
            price: 40,
          },
          {
            product: products[1]._id,
            quantity: 1,
            price: 65,
          },
        ],
        totalAmount: 145,
        paymentStatus: 'completed',
        paymentMethod: 'upi',
        orderStatus: 'completed',
        status: 'completed',
        completedAt: new Date(),
      },
      {
        orderNumber: `ORD-${Date.now()}-2`,
        buyer: users[3]._id,
        shop: shops[1]._id,
        items: [
          {
            product: products[3]._id,
            quantity: 1,
            price: 250,
          },
        ],
        totalAmount: 250,
        paymentStatus: 'completed',
        paymentMethod: 'upi',
        orderStatus: 'ready_for_pickup',
        status: 'ready_for_pickup',
      },
    ]);
    console.log(`Created ${orders.length} sample orders`);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('Sample user credentials:');
    console.log('Customer: customer@example.com / password123');
    console.log('Shop Owner: shopowner@example.com / password123');
    console.log('Admin: admin@example.com / password123\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
