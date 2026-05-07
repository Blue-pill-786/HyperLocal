# HyperLocal - Modern MERN Marketplace

A full-stack, modern MERN (MongoDB, Express, React, Node.js) web application for a hyperlocal marketplace where users can buy and sell products from their neighborhood.

## 🚀 Tech Stack (2026 Edition)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.19
- **Language**: TypeScript 5.3
- **Database**: MongoDB 7.0 with Mongoose 8.2
- **Authentication**: JWT (jsonwebtoken 9.1)
- **Real-time**: Socket.io 4.7
- **Security**: Helmet, CORS, Rate Limiting, bcryptjs
- **Validation**: Joi
- **Server Build**: Vite + TypeScript

### Frontend
- **UI Framework**: React 18.2
- **Build Tool**: Vite 5.0 (10x faster than CRA)
- **Language**: TypeScript 5.3
- **Router**: React Router 6.20
- **State Management**: Zustand 4.4 (lightweight alternative to Redux)
- **Server State**: TanStack Query 5.28 (data fetching & caching)
- **HTTP Client**: Axios 1.6 with interceptors
- **Forms**: React Hook Form 7.49 + Zod 3.22 validation
- **Real-time**: Socket.io Client 4.7.2
- **UI Components**: Lucide React (icons)
- **Styling**: Tailwind CSS 3.4 (or customize)

### DevOps & Tools
- **Container**: Docker & Docker Compose
- **Testing**: Vitest (modern, fast)
- **Linting**: ESLint
- **Formatting**: Prettier
- **CI/CD**: GitHub Actions (ready to setup)

## 📁 Project Structure

```
HyperLocal/
├── backend/
│   ├── src/
│   │   ├── server.ts              # Express server setup
│   │   ├── middleware/
│   │   │   └── auth.ts            # JWT authentication
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript interfaces
│   │   ├── utils/
│   │   │   ├── logger.ts          # Logging utility
│   │   │   └── validation.ts      # Joi schemas
│   │   ├── models/                # TODO: Mongoose models
│   │   ├── controllers/           # TODO: Route handlers
│   │   └── routes/                # TODO: API routes
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx               # React entry point
│   │   ├── App.tsx                # Router setup
│   │   ├── index.css              # Global styles
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── NotFound.tsx
│   │   ├── stores/
│   │   │   ├── authStore.ts       # Auth state (Zustand)
│   │   │   └── cartStore.ts       # Cart state (Zustand)
│   │   ├── hooks/
│   │   │   └── useApi.ts          # TanStack Query hooks
│   │   ├── services/
│   │   │   └── api.ts             # Axios instance with interceptors
│   │   └── types/
│   │       └── index.ts           # TypeScript interfaces
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .prettierrc
│
├── docker-compose.yml             # Local dev environment
├── .env.example
├── .gitignore
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker & Docker Compose (optional, for MongoDB)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Blue-pill-786/HyperLocal.git
cd HyperLocal
```

### 2. Setup Environment Variables
```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `.env` files with your configuration:
```env
# Backend .env
MONGODB_URI=mongodb://localhost:27017/hyperlocal
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000
PORT=5000

# Frontend .env (if needed)
VITE_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB (using Docker)
```bash
docker-compose up -d
```

### 4. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 5. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

## 📜 Available Scripts

### Backend
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run lint         # Run ESLint with auto-fix
npm test             # Run tests with Vitest
npm run test:coverage # Generate coverage report
```

### Frontend
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
npm test             # Run tests with Vitest
npm run test:coverage # Generate coverage report
```

## 🔐 Key Features Implemented

✅ **TypeScript** - Full type safety
✅ **Modern Build** - Vite for lightning-fast builds
✅ **Security** - Helmet, Rate Limiting, JWT Auth
✅ **State Management** - Zustand (lightweight)
✅ **Data Fetching** - TanStack Query (caching, sync)
✅ **Form Validation** - Zod + React Hook Form
✅ **Real-time** - Socket.io configured
✅ **Responsive UI** - Tailwind CSS
✅ **API Client** - Axios with interceptors
✅ **Code Quality** - ESLint, Prettier, TypeScript strict mode
✅ **Logging** - Structured logging system
✅ **Docker** - Dev environment with Docker Compose

## 📝 Next Steps (TODO)

### Backend
- [ ] Create MongoDB models (User, Product, Order, etc.)
- [ ] Implement authentication routes (register, login)
- [ ] Create product CRUD controllers
- [ ] Implement order management
- [ ] Setup payment integration (Stripe/Razorpay)
- [ ] Add file upload handling (AWS S3)
- [ ] Implement real-time notifications
- [ ] Add unit & integration tests

### Frontend
- [ ] Connect authentication pages
- [ ] Implement product listing with filters
- [ ] Add payment checkout flow
- [ ] Setup real-time chat for sellers
- [ ] Add user reviews & ratings
- [ ] Implement seller dashboard
- [ ] Setup notifications
- [ ] Add unit & integration tests

### DevOps
- [ ] Setup GitHub Actions CI/CD
- [ ] Configure environment-based deployments
- [ ] Setup staging environment
- [ ] Add performance monitoring
- [ ] Configure error tracking (Sentry)

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)
```bash
npm run build
npm start
```

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
# Upload dist/ folder
```

## 🔗 API Endpoints (To be implemented)

```
GET    /api/v1/products              - List all products
GET    /api/v1/products/:id          - Get product details
POST   /api/v1/products              - Create product (seller)
PUT    /api/v1/products/:id          - Update product
DELETE /api/v1/products/:id          - Delete product

POST   /api/v1/auth/register         - Register user
POST   /api/v1/auth/login            - Login user
POST   /api/v1/auth/logout           - Logout user
GET    /api/v1/auth/me               - Get current user

GET    /api/v1/cart                  - Get user cart
POST   /api/v1/cart/items            - Add to cart
DELETE /api/v1/cart/items/:id        - Remove from cart

GET    /api/v1/orders                - Get user orders
POST   /api/v1/orders                - Create order
GET    /api/v1/orders/:id            - Get order details
```

## 📚 Documentation

- [Express.js Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vitejs.dev/)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 💬 Support

For issues and questions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for the local community**
