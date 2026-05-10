# Deployment Guide

## 🚀 Production Deployment

### Backend Deployment on Render

1. **Prepare Backend**
   ```bash
   cd backend
   npm install
   ```

2. **Create Render Account**
   - Go to https://render.com
   - Sign up and connect GitHub account

3. **Create Web Service**
   - Click "New +" → "Web Service"
   - Select your GitHub repository
   - Configure:
     - **Name**: hyperlocal-backend
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

4. **Set Environment Variables**
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=<Your MongoDB Atlas URL>
   JWT_SECRET=<Strong random string>
   JWT_EXPIRE=7d
   RAZORPAY_KEY_ID=<Your Razorpay Key>
   RAZORPAY_KEY_SECRET=<Your Razorpay Secret>
   CORS_ORIGIN=<Your frontend URL>
   FRONTEND_URL=<Your frontend URL>
   ```

5. **Deploy**
   - Render will automatically deploy on git push
   - Backend URL: `https://your-app-name.onrender.com`

### Frontend Deployment on Vercel

1. **Prepare Frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up and connect GitHub

3. **Deploy Project**
   - Import your repository
   - Select `frontend` directory as root
   - Configure:
     - **Framework**: Create React App
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`

4. **Set Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   REACT_APP_RAZORPAY_KEY_ID=<Your Razorpay Key>
   ```

5. **Deploy**
   - Vercel will automatically deploy on git push
   - Frontend URL: `https://your-app-name.vercel.app`

### Database Setup on MongoDB Atlas

1. **Create Account**
   - Go to https://mongodb.com/cloud/atlas
   - Sign up with email

2. **Create Cluster**
   - Click "Build a Cluster"
   - Choose Free tier
   - Select region (India recommended)
   - Cluster name: `hyperlocal`

3. **Configure Security**
   - Go to Network Access
   - Add IP: `0.0.0.0/0` (Allow all - not recommended for production)
   - Or add specific IPs

4. **Create Database User**
   - Go to Database Access
   - Add New Database User
   - Username: `hyperlocal`
   - Password: Generate strong password

5. **Get Connection String**
   - Click "Connect" on cluster
   - Select "Connect your application"
   - Copy connection string
   - Replace `<username>` and `<password>`

6. **Update Backend .env**
   ```
   MONGODB_URI=mongodb+srv://hyperlocal:<password>@cluster0.xxxxx.mongodb.net/hyperlocal?retryWrites=true&w=majority
   ```

## 🔐 Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Change database password
- [ ] Enable HTTPS on frontend and backend
- [ ] Configure CORS properly (not * in production)
- [ ] Set NODE_ENV to production
- [ ] Configure rate limiting
- [ ] Enable database backups
- [ ] Use environment variables for all secrets
- [ ] Implement logging and monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure CORS headers properly
- [ ] Implement request validation
- [ ] Enable HSTS headers
- [ ] Use strong passwords everywhere
- [ ] Setup automated backups

## 📊 Monitoring & Logging

### Backend Logging
Add Winston logger:
```bash
npm install winston
```

```javascript
// logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

module.exports = logger;
```

### Error Tracking with Sentry
```bash
npm install @sentry/node
```

```javascript
const Sentry = require('@sentry/node');

Sentry.init({ dsn: 'YOUR_SENTRY_DSN' });
app.use(Sentry.Handlers.errorHandler());
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd backend && npm install
      
      - name: Run tests
        run: cd backend && npm test
      
      - name: Deploy to Render
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd frontend && npm install
      
      - name: Build
        run: cd frontend && npm run build
      
      - name: Deploy to Vercel
        run: |
          npm install -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## 🚀 Scaling Considerations

### Horizontal Scaling
1. Use load balancer (AWS ELB, Render)
2. Deploy multiple backend instances
3. Use managed MongoDB (Atlas)
4. Use CDN for static assets (Cloudflare)

### Database Optimization
1. Add indexes on frequently queried fields
2. Use aggregation pipelines for complex queries
3. Implement caching (Redis)
4. Monitor slow queries

### Performance Optimization
1. Implement API response caching
2. Use gzip compression
3. Optimize image sizes
4. Implement lazy loading
5. Use service workers
6. Enable HTTP/2

## 📱 Mobile App Deployment

For React Native app:
```bash
npm install -g react-native-cli
react-native init HyperLocal
# Copy shared utilities from web version
# Build for iOS and Android
```

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Check connection string
- Verify IP whitelist
- Ensure database user has correct password

**CORS Error**
- Update CORS_ORIGIN in .env
- Check frontend URL configuration

**Razorpay Integration Issues**
- Verify API keys
- Check webhook configuration
- Test with sandbox environment first

**Socket.IO Connection Issues**
- Ensure CORS is properly configured
- Check firewall settings
- Verify WebSocket support

## 📞 Support & Contact

- **Email**: support@hyperlocal.app
- **Issues**: GitHub Issues
- **Documentation**: https://hyperlocal.app/docs

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Deployment](https://create-react-app.dev/deployment/)

---

**Happy Deploying! 🎉**
