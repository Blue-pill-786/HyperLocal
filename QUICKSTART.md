# HyperLocal Quickstart

Run the full-stack pickup ordering platform locally.

## Prerequisites

- Node.js 18+
- MongoDB local instance or MongoDB Atlas URI
- Razorpay account for live UPI payments

## Backend

```bash
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

Backend URL: `http://localhost:5000`

Required `.env` values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hyperlocal
JWT_SECRET=replace_with_a_long_secret
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
FRONTEND_URL=http://localhost:3000
```

The server starts without Razorpay keys, but `/api/payments/create-order` requires them.

## Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm start
```

Frontend URL: `http://localhost:3000`

Required `.env` values:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxx
```

## Seed Accounts

- Customer: `customer@example.com` / `password123`
- Shop owner: `shopowner@example.com` / `password123`
- Admin: `admin@example.com` / `password123`

## Main Routes

- Customer: `/`, `/shop/:shopId`, `/cart`, `/orders`, `/order/:orderId`
- Shop owner: `/dashboard`
- Admin: `/admin`

## Order Flow

1. Customer browses nearby shops.
2. Customer adds items to cart.
3. Customer creates a pickup order and pays using Razorpay UPI if keys are configured.
4. Shop owner receives live order updates in the dashboard.
5. Shop owner moves status through `pending`, `accepted`, `preparing`, `ready_for_pickup`, and `completed`.
6. Customer sees live tracking plus a pickup QR code.
