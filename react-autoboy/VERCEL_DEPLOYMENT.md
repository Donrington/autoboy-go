# Vercel Deployment Guide for AutoBoy Frontend

## 🚨 IMPORTANT: Set Environment Variables First!

Your Vercel deployment needs environment variables to connect to the production backend.

### Quick Fix (If Already Deployed)

1. Go to: https://vercel.com/dashboard
2. Select your `autoboy-go` project
3. Click **Settings** → **Environment Variables**
4. Add these variables:

```
VITE_API_URL = https://autoboy-go.onrender.com/api/v1
VITE_BACKEND_PROXY_URL = https://autoboy-go.onrender.com
```

5. Click **Deployments** → Select latest deployment → Click **Redeploy**

---

## Via Vercel CLI

```bash
# Navigate to frontend folder
cd react-autoboy

# Set environment variables
vercel env add VITE_API_URL production
# Enter: https://autoboy-go.onrender.com/api/v1

vercel env add VITE_BACKEND_PROXY_URL production
# Enter: https://autoboy-go.onrender.com

# Redeploy
vercel --prod
```

---

## Full Deployment Steps (From Scratch)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Navigate to Project
```bash
cd react-autoboy
```

### 4. Deploy
```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No (first time) / Yes (if redeploying)
- **Project name?** autoboy-go (or your choice)
- **Directory?** `./` (current directory)
- **Build Command?** `npm run build`
- **Output Directory?** `dist`
- **Development Command?** `npm run dev`

### 5. Set Production Environment Variables

**Option A: Via Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add:
   - `VITE_API_URL` = `https://autoboy-go.onrender.com/api/v1`
   - `VITE_BACKEND_PROXY_URL` = `https://autoboy-go.onrender.com`

**Option B: Via CLI**
```bash
vercel env add VITE_API_URL production
# Enter: https://autoboy-go.onrender.com/api/v1

vercel env add VITE_BACKEND_PROXY_URL production
# Enter: https://autoboy-go.onrender.com
```

### 6. Deploy to Production
```bash
vercel --prod
```

---

## Environment Variables Explained

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | `https://autoboy-go.onrender.com/api/v1` | Base URL for all API calls |
| `VITE_BACKEND_PROXY_URL` | `https://autoboy-go.onrender.com` | Backend URL (for vite proxy in dev mode) |

**Note**: In production builds, Vercel doesn't use the proxy. The frontend calls the backend directly using `VITE_API_URL`.

---

## Troubleshooting

### Error: "Failed to fetch" or "localhost:8080"
**Problem**: Environment variables not set in Vercel
**Solution**: Follow steps 5-6 above

### Error: "CORS policy blocked"
**Problem**: Backend doesn't allow requests from `autoboy-go.vercel.app`
**Solution**: Update backend CORS configuration (see below)

### Error: "403 Forbidden"
**Problem**: Backend rejecting requests
**Solution**: Check backend CORS and ensure it's running

---

## Update Backend CORS (Required!)

Your Go backend needs to allow requests from Vercel:

```go
// In autoboy-backend/main.go or middleware/cors.go
config := cors.Config{
    AllowOrigins: []string{
        "http://localhost:3000",
        "https://autoboy-go.vercel.app",  // Add this!
    },
    AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
    ExposeHeaders: []string{"Content-Length"},
    AllowCredentials: true,
    MaxAge: 12 * time.Hour,
}
```

Then redeploy your backend to Render.

---

## Verify Deployment

1. Visit: https://autoboy-go.vercel.app
2. Open browser console (F12)
3. Try to login
4. Check for errors:
   - ✅ Should show: `POST https://autoboy-go.onrender.com/api/v1/auth/login`
   - ❌ Should NOT show: `localhost:8080`

---

## Automatic Redeployment

Vercel automatically redeploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update frontend"
git push origin main

# Vercel automatically deploys!
```

---

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Domains**
3. Add your custom domain (e.g., `autoboy.com`)
4. Follow DNS configuration instructions
5. Update backend CORS to include your custom domain

---

## Monitor Deployments

- **Dashboard**: https://vercel.com/dashboard
- **Logs**: Click on deployment → View **Function Logs** and **Build Logs**
- **Analytics**: Enable in Settings → Analytics

---

## Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **Build Configuration**: https://vercel.com/docs/build-step

---

**Your App**: https://autoboy-go.vercel.app
**Backend**: https://autoboy-go.onrender.com
**GitHub**: https://github.com/Donrington/autoboy-go
