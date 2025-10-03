# AutoBoy Frontend Deployment Guide

## Deploy React Web App to Render

### Quick Deploy Steps:

1. **Push to GitHub**
   ```bash
   cd react-autoboy
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/autoboy-frontend.git
   git push -u origin main
   ```

2. **Deploy via Render Dashboard**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Static Site"
   - Connect GitHub repository
   - Configure:
     - **Name**: `autoboy-frontend`
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `dist`

3. **Environment Variables**
   ```
   VITE_API_URL=https://autoboy-backend.onrender.com
   VITE_WS_URL=wss://autoboy-backend.onrender.com
   ```

### Alternative: Use render.yaml
- Push `render.yaml` to repository
- In Render: "New +" → "Blueprint" → Select repository

### Post-Deployment:
- Frontend URL: `https://autoboy-frontend.onrender.com`
- Update CORS in backend to include this URL
- Test all API connections

### Custom Domain (Optional):
1. Render Settings → Custom Domain
2. Add your domain
3. Update DNS records
4. SSL auto-generated