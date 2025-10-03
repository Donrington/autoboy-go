# AutoBoy Backend Deployment Guide

## Deploy to Render

### Option 1: Using Render Dashboard (Recommended)

1. **Create a Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Connect GitHub Repository**
   - Push your code to GitHub
   - In Render dashboard, click "New +"
   - Select "Web Service"
   - Connect your GitHub repository

3. **Configure Service**
   - **Name**: `autoboy-backend`
   - **Environment**: `Go`
   - **Build Command**: `go build -o main .`
   - **Start Command**: `./main`
   - **Plan**: Free

4. **Set Environment Variables**
   ```
   GIN_MODE=release
   PORT=8080
   JWT_SECRET=your-secret-key
   MONGODB_URI=your-mongodb-connection-string
   REDIS_URL=your-redis-connection-string
   FRONTEND_URL=https://autoboy.vercel.app
   ```

### Option 2: Using render.yaml (Infrastructure as Code)

1. **Push render.yaml to your repository**
2. **In Render Dashboard**:
   - Click "New +"
   - Select "Blueprint"
   - Connect repository and select `render.yaml`

### Database Setup

#### MongoDB Atlas (Recommended)
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Add to `MONGODB_URI` environment variable

#### Redis (Optional)
1. Use Render Redis or external provider
2. Add connection string to `REDIS_URL`

### Environment Variables Required

```bash
# Required
GIN_MODE=release
PORT=8080
JWT_SECRET=your-jwt-secret-key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/autoboy

# Optional
REDIS_URL=redis://username:password@host:port
FRONTEND_URL=https://your-frontend-domain.com
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Post-Deployment

1. **Test API Endpoints**
   ```bash
   curl https://your-app.onrender.com/health
   ```

2. **Update Frontend URLs**
   - Update WebSocket URL in mobile app
   - Update API base URL in frontend

3. **Monitor Logs**
   - Check Render dashboard for deployment logs
   - Monitor application performance

### Troubleshooting

- **Build Fails**: Check Go version compatibility
- **Database Connection**: Verify MongoDB URI and network access
- **CORS Issues**: Update allowed origins in main.go
- **WebSocket Issues**: Ensure WebSocket upgrade headers are allowed

### Custom Domain (Optional)

1. In Render dashboard, go to Settings
2. Add custom domain
3. Update DNS records as instructed
4. SSL certificate will be auto-generated