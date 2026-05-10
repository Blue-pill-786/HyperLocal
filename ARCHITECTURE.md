# Architecture Guide - HyperLocal

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Pages: Home, Login, Shop, Cart, OrderTrack, Dashboard│   │
│  │ Components: Header, Footer, ProductCard, OrderStatus│   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │ HTTP/WebSocket  │
        │ (Axios/Socket.io)
        │
┌───────▼─────────────────────────────────────────────────────┐
│                  Backend (Node.js/Express)                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Routes: /api/auth, /api/shops, /api/products, etc   │    │
│  │ Controllers: Handle business logic                  │    │
│  │ Middleware: Auth, Error handling, Validation        │    │
│  │ Services: Payment, Email, Notifications             │    │
│  └─────────────────────────────────────────────────────┘    │
└────────────┬──────────────────────────────┬──────────────────┘
             │                              │
      ┌──────▼─────────┐           ┌────────▼───────────┐
      │   MongoDB      │           │    Razorpay API    │
      │   (Database)   │           │   (Payments)       │
      └────────────────┘           └────────────────────┘
```

## 📊 Data Flow

### User Registration & Login Flow
```
User Input (Register)
    ↓
Frontend Form Submission
    ↓
API POST /api/auth/register
    ↓
Backend Validation
    ↓
Hash Password (bcryptjs)
    ↓
Save to MongoDB
    ↓
Generate JWT Token
    ↓
Return token + user data
    ↓
Frontend stores token in localStorage
    ↓
Set Authorization header for future requests
```

### Order Placement Flow
```
Customer browses products
    ↓
Adds items to cart (Zustand store)
    ↓
Proceeds to checkout
    ↓
API POST /api/orders
    ↓
Backend validates products & stock
    ↓
Creates order in MongoDB
    ↓
API POST /api/payments/create-order
    ↓
Razorpay creates payment order
    ↓
Frontend opens Razorpay modal
    ↓
User completes payment
    ↓
Razorpay callback
    ↓
API POST /api/payments/verify
    ↓
Backend verifies signature
    ↓
Updates order status to "accepted"
    ↓
Socket.io emits event to shop owner
    ↓
Shop owner receives notification
```

### Real-time Order Update Flow
```
Shop owner updates order status
    ↓
API PUT /api/orders/{id}/status
    ↓
Backend updates MongoDB
    ↓
Backend emits Socket.io event: 'order_status_update'
    ↓
Socket.io broadcasts to listening clients
    ↓
Frontend listens for 'order_status_update'
    ↓
Frontend updates UI in real-time
    ↓
Customer sees status change instantly
```

## 🗄️ Database Schema Design

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: Enum['customer', 'shop_owner', 'admin'],
  avatar: String,
  address: {
    street: String,
    city: String,
    state: String,
    coordinates: { latitude, longitude }
  },
  isVerified: Boolean,
  isActive: Boolean,
  favorites: [ShopId],
  ratings: { averageRating, totalRatings },
  preferences: { notifications, darkMode },
  createdAt: Date,
  updatedAt: Date
}
```

### Shop Collection
```javascript
{
  _id: ObjectId,
  owner: UserId,
  name: String,
  description: String,
  category: Enum['grocery', 'pharmacy', 'food', etc],
  location: {
    type: 'Point',
    coordinates: [longitude, latitude], // GeoJSON
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  contactNumber: String,
  email: String,
  logo: String,
  bannerImage: String,
  rating: Number,
  totalReviews: Number,
  isApproved: Boolean,
  isActive: Boolean,
  totalOrders: Number,
  totalRevenue: Number,
  operatingHours: { open: String, close: String },
  createdAt: Date,
  updatedAt: Date
}
```

### Product Collection
```javascript
{
  _id: ObjectId,
  shop: ShopId,
  name: String,
  description: String,
  category: String,
  price: Number,
  originalPrice: Number,
  stock: Number,
  images: [String],
  sku: String,
  isAvailable: Boolean,
  rating: Number,
  totalReviews: Number,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Order Collection
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique),
  buyer: UserId,
  shop: ShopId,
  products: [{
    product: ProductId,
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  paymentStatus: Enum['pending', 'completed', 'failed'],
  paymentMethod: Enum['upi', 'card', 'wallet', 'cash'],
  paymentId: String,
  orderStatus: Enum['pending', 'accepted', 'ready', 'delivered', 'cancelled'],
  deliveryAddress: { street, city, state, zipCode, phone },
  specialInstructions: String,
  estimatedDelivery: Date,
  completedAt: Date,
  cancelledAt: Date,
  notes: [{ message, createdAt }],
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Collection
```javascript
{
  _id: ObjectId,
  orderId: OrderId,
  userId: UserId,
  shopId: ShopId,
  amount: Number,
  currency: String,
  paymentMethod: String,
  transactionId: String (unique),
  razorpayPaymentId: String,
  razorpayOrderId: String,
  status: Enum['pending', 'authorized', 'captured', 'failed', 'refunded'],
  paymentDetails: { email, phone, description },
  refund: { status, amount, reason, processedAt },
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Authentication & Security

### JWT Token Structure
```javascript
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "id": "user_id",
  "email": "user@example.com",
  "role": "customer",
  "iat": timestamp,
  "exp": timestamp + 7 days
}

Signature: HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  JWT_SECRET
)
```

### Request Flow with Auth
```
Client Request
    ↓
Extract token from Authorization header
    ↓
Verify JWT signature
    ↓
Check token expiration
    ↓
Attach user object to req.user
    ↓
Pass to next middleware/route
    ↓
If unauthorized → Return 401
```

## 🗂️ API Endpoint Structure

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Shop Routes
- `GET /api/shops/nearby` - Get nearby shops by location
- `GET /api/shops/{id}` - Get shop details
- `POST /api/shops` - Create shop (shop owner)
- `PUT /api/shops/{id}` - Update shop (shop owner)
- `DELETE /api/shops/{id}` - Delete shop (shop owner)
- `GET /api/shops/owner/my-shop` - Get shop owner's shop

### Product Routes
- `GET /api/products/shop/{shopId}` - Get products by shop
- `GET /api/products/{id}` - Get product details
- `GET /api/products/search` - Search products
- `POST /api/products/shop/{shopId}` - Create product (shop owner)
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Order Routes
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order details
- `GET /api/orders/user/orders` - Get user's orders
- `GET /api/orders/shop/orders` - Get shop's orders
- `PUT /api/orders/{id}/status` - Update order status
- `PUT /api/orders/{id}/cancel` - Cancel order

### Payment Routes
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/{id}` - Get payment details
- `GET /api/payments/user/payments` - Get user's payments

### Review Routes
- `POST /api/reviews/product` - Create product review
- `POST /api/reviews/shop` - Create shop review
- `GET /api/reviews/product/{id}` - Get product reviews
- `GET /api/reviews/shop/{id}` - Get shop reviews
- `DELETE /api/reviews/{id}` - Delete review

## 🔄 State Management (Zustand)

### useAuthStore
```javascript
{
  user: { id, name, email, role },
  token: string,
  isAuthenticated: boolean,
  setAuth(user, token),
  logout(),
  setUser(user)
}
```

### useCartStore
```javascript
{
  cart: [{ id, name, price, quantity, shopId }],
  addToCart(product),
  removeFromCart(productId),
  updateQuantity(productId, quantity),
  clearCart()
}
```

### useOrderStore
```javascript
{
  orders: [order],
  currentOrder: order,
  setOrders(orders),
  setCurrentOrder(order),
  addOrder(order)
}
```

### useShopStore
```javascript
{
  shops: [shop],
  currentShop: shop,
  nearbyShops: [shop],
  setShops(shops),
  setCurrentShop(shop),
  setNearbyShops(shops)
}
```

## 🎯 Component Architecture

### Page Components
- **HomePage**: Browse shops, search functionality
- **LoginPage**: User authentication
- **RegisterPage**: User registration with role selection
- **ShopDetailsPage**: View shop products, add to cart
- **CartPage**: Review cart, checkout
- **OrderTrackingPage**: Track order status in real-time
- **ShopOwnerDashboard**: Manage shop, orders, products

### Reusable Components
- **Header**: Navigation, authentication status
- **ProductCard**: Display product information
- **OrderStatusTimeline**: Show order progress
- **PaymentModal**: Handle Razorpay integration

## 🔌 Socket.IO Implementation

### Events

**Server Events:**
- `connection` - Client connects
- `join_shop_queue` - User joins shop's queue
- `disconnect` - Client disconnects

**Client Events:**
- `order_received` - New order received
- `order_status_update` - Order status changed
- `status_changed` - Status change notification

### Room-based Communication
```javascript
// Shop-specific notifications
socket.join(`shop_${shopId}`);
io.to(`shop_${shopId}`).emit('order_received', orderData);

// Order-specific notifications
socket.join(`order_${orderId}`);
io.to(`order_${orderId}`).emit('status_changed', statusData);
```

## 💳 Payment Integration

### Razorpay Flow
1. Create payment order on backend
2. Get Razorpay order ID
3. Initialize Razorpay checkout on frontend
4. User completes payment
5. Verify payment signature on backend
6. Update order status
7. Send confirmation to customer and shop

## 🚀 Performance Optimization

### Frontend
- Code splitting with React.lazy()
- Image optimization with lazy loading
- Memoization for expensive components
- Local storage for cart persistence
- Socket.io for real-time updates (no polling)

### Backend
- Database indexing on frequently queried fields
- Pagination for large result sets
- Response caching for static data
- Connection pooling for MongoDB
- Error handling and retry logic

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless backend instances
- Sticky sessions for WebSocket
- Load balancer for traffic distribution
- Separate database from application

### Database Scaling
- Database replication
- Sharding for large collections
- Read replicas for queries
- Automated backups

### Caching Strategy
- Redis for session management
- API response caching
- Client-side caching with localStorage

---

**Architecture designed for scalability, maintainability, and performance! 🚀**
