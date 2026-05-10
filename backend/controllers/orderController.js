const Order = require('../models/Order');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const { generateOrderId } = require('../utils/validators');

const serializeOrder = (order) => {
  const value = typeof order.toObject === 'function' ? order.toObject() : order;
  return { ...value, products: value.items || [] };
};

const emitOrderUpdate = (req, order) => {
  const io = req.app.get('io');
  if (!io) return;

  const payload = serializeOrder(order);
  io.to(`shop_${order.shop}`).emit('order_updated', payload);
  io.to(`order_${order._id}`).emit('status_changed', {
    orderId: order._id,
    status: order.orderStatus,
    orderStatus: order.orderStatus,
  });
};

exports.createOrder = async (req, res) => {
  try {
    const { shopId, products, items, specialInstructions, estimatedPreparationTime, couponCode } = req.body;
    const requestedItems = products || items;

    if (!shopId || !Array.isArray(requestedItems) || requestedItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide shopId and products' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop || !shop.isActive) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of requestedItems) {
      const product = await Product.findById(item.productId || item.product);
      const quantity = Number(item.quantity || 1);

      if (!product || product.shop.toString() !== shopId || !product.isAvailable) {
        return res.status(404).json({ success: false, message: 'Product not found in this shop' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      totalAmount += product.price * quantity;
      orderItems.push({ product: product._id, quantity, price: product.price });
      product.stock -= quantity;
      await product.save();
    }

    const order = await Order.create({
      orderNumber: generateOrderId(),
      buyer: req.user.id,
      shop: shopId,
      items: orderItems,
      totalAmount,
      specialInstructions,
      estimatedPreparationTime: estimatedPreparationTime || 15,
      couponCode,
      paymentMethod: 'upi',
    });

    shop.totalOrders += 1;
    await shop.save();
    emitOrderUpdate(req, order);

    res.status(201).json({ success: true, message: 'Order created successfully', data: serializeOrder(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone')
      .populate('shop', 'name location contactNumber')
      .populate('items.product', 'name price imageUrl images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.buyer._id.toString() !== req.user.id && req.user.role !== 'admin') {
      const shop = await Shop.findById(order.shop);
      if (!shop || shop.owner.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'You are not authorized to view this order' });
      }
    }

    res.json({ success: true, data: serializeOrder(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('shop', 'name location contactNumber')
      .populate('items.product', 'name price imageUrl images')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders.map(serializeOrder) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getShopOrders = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user.id });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const orders = await Order.find({ shop: shop._id })
      .populate('buyer', 'name email phone')
      .populate('items.product', 'name price imageUrl images')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders.map(serializeOrder) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ['pending', 'accepted', 'rejected', 'preparing', 'ready_for_pickup', 'completed', 'cancelled'];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const shop = await Shop.findById(order.shop);
    if (!shop || (shop.owner.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ success: false, message: 'You are not authorized to update this order' });
    }

    order.orderStatus = orderStatus;
    order.status = orderStatus;
    if (orderStatus === 'ready_for_pickup') order.readyAt = new Date();
    if (orderStatus === 'completed') {
      order.completedAt = new Date();
      shop.totalRevenue += order.totalAmount;
      await shop.save();
    }
    if (['cancelled', 'rejected'].includes(orderStatus)) order.cancelledAt = new Date();

    await order.save();
    emitOrderUpdate(req, order);

    res.json({ success: true, message: 'Order status updated successfully', data: serializeOrder(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to cancel this order' });
    }

    if (!['pending', 'accepted'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    order.orderStatus = 'cancelled';
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = reason;

    await order.save();
    emitOrderUpdate(req, order);

    res.json({ success: true, message: 'Order cancelled successfully', data: serializeOrder(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
