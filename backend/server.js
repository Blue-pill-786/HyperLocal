const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
app.set('io', io);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hyperlocal')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Socket.io events for real-time updates
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_shop_queue', (shopId) => {
    socket.join(`shop_${shopId}`);
    console.log(`User joined shop queue: ${shopId}`);
  });

  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`);
    console.log(`User joined order room: ${orderId}`);
  });

  socket.on('new_order', (data) => {
    io.to(`shop_${data.shopId}`).emit('order_received', data);
  });

  socket.on('order_status_update', (data) => {
    io.to(`order_${data.orderId}`).emit('status_changed', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server error:', err.message);
});
module.exports = { app, io };
