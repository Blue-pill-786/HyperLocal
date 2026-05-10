# HyperLocal

HyperLocal is a full-stack hyperlocal pickup ordering platform for office employees and nearby shops. Customers browse shops, place pickup orders, pay through Razorpay UPI, and track order status in real time. Shop owners manage menus and incoming orders. Admins manage shops, users, transactions, and platform analytics.

## Tech Stack

- Frontend: React, React Router, Tailwind CSS, Zustand, Socket.IO client, Razorpay Checkout
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Socket.IO, Razorpay
- Deployment: Vercel for frontend, Render/Railway for backend, MongoDB Atlas for database

## Project Structure

```text
HyperLocal/
  backend/
    config/
    controllers/
    middleware/
    models/
    routes/
    seeds/
    utils/
    server.js
  frontend/
    public/
    src/
      components/
      pages/
      store/
      utils/
      App.jsx
```

## Features

- Customer registration and login
- Shop owner registration and login
- JWT authentication and role-based authorization
- Nearby shop browsing with search/filter support
- Product/menu listing
- Cart and pickup checkout
- Razorpay UPI order creation and signature verification
- Transaction history persistence
- Live order updates with Socket.IO
- Order statuses: pending, accepted, rejected, preparing, ready for pickup, completed, cancelled
- QR pickup code on order tracking page
- Customer order history
- Shop dashboard with order queue, status updates, products, earnings, and popular products
- Admin dashboard with overview metrics, shop approval, and transaction views
- Reviews, ratings, favorite shops, coupons-ready fields, business hours fields, dark mode

## API Overview

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Shops:

- `GET /api/shops/nearby`
- `GET /api/shops/:id`
- `POST /api/shops`
- `GET /api/shops/owner/my-shop`
- `PUT /api/shops/:id`
- `DELETE /api/shops/:id`

Products:

- `GET /api/products/shop/:shopId`
- `GET /api/products/search`
- `GET /api/products/:id`
- `POST /api/products/shop/:shopId`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

Orders:

- `POST /api/orders`
- `GET /api/orders/user/orders`
- `GET /api/orders/shop/orders`
- `GET /api/orders/:id`
- `PUT /api/orders/:id/status`
- `PUT /api/orders/:id/cancel`

Payments:

- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `GET /api/payments/user/payments`
- `GET /api/payments/:paymentId`

Admin:

- `GET /api/admin/overview`
- `GET /api/admin/users`
- `GET /api/admin/shops`
- `PATCH /api/admin/shops/:id/approval`
- `GET /api/admin/transactions`

## Database Models

- `User`: customer, shop owner, admin, profile, favorites
- `Shop`: owner, category, geolocation, business hours, rating, revenue
- `Product`: shop, price, stock, images, availability, prep time
- `Order`: buyer, shop, items, pickup status, pickup code, payment state
- `Payment`: Razorpay IDs, amount, method, status, refund metadata
- `Review`: product/shop reviews, ratings, verified purchase flag

## Razorpay UPI Setup

1. Create a Razorpay account and get test/live keys.
2. Add backend keys to `backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

3. Add frontend key to `frontend/.env`:

```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxx
```

4. Checkout calls `/api/payments/create-order`, opens Razorpay Checkout with UPI enabled, then posts the signed response to `/api/payments/verify`.

## Socket.IO Events

- `join_shop_queue`: shop dashboard joins `shop_<shopId>`
- `join_order`: customer tracking page joins `order_<orderId>`
- `order_updated`: emitted to shop room when orders are created or updated
- `status_changed`: emitted to order room when shop changes order status

## Local Development

See [QUICKSTART.md](./QUICKSTART.md).

## Deployment

Frontend on Vercel:

- Root: `frontend`
- Build command: `npm run build`
- Output: `build`
- Env: `REACT_APP_API_URL`, `REACT_APP_RAZORPAY_KEY_ID`

Backend on Render/Railway:

- Root: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Env: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `FRONTEND_URL`

MongoDB Atlas:

- Create a cluster.
- Add the backend deploy host to network access.
- Use the Atlas connection string as `MONGODB_URI`.
