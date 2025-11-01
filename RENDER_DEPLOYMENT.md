# 🚀 Deploying SlotSwapper Backend to Render

This guide walks you through deploying the SlotSwapper backend to Render, which supports long-running processes (unlike Vercel serverless), so your WebSocket server will work!

## 📋 Prerequisites

1. **GitHub Repository**: Your code is already on GitHub (Natraj16/SlotSwapper)
2. **MongoDB Atlas**: You should have your MongoDB connection string ready
3. **Render Account**: Sign up at [render.com](https://render.com) (free tier available)

## 🔧 Step 1: Prepare Environment Variables

You'll need these environment variables for Render:

- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - Your JWT secret key (same one you use locally)
- `FRONTEND_URL` - Will be your frontend URL (use `http://localhost:5173` initially, update after deploying frontend)
- `NODE_ENV` - Set to `production`
- `PORT` - Render automatically provides this, so you don't need to set it

## 🌐 Step 2: Deploy to Render

### Option A: Deploy from Dashboard (Recommended)

1. **Go to Render Dashboard**
   - Visit [dashboard.render.com](https://dashboard.render.com)
   - Sign up or log in with GitHub

2. **Create New Web Service**
   - Click "New +" button → Select "Web Service"
   - Connect your GitHub account if not already connected
   - Select your repository: `Natraj16/SlotSwapper`

3. **Configure Service Settings**
   - **Name**: `slotswapper-backend` (or any name you prefer)
   - **Region**: Choose closest to your users (e.g., Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or paid if you need better performance)

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable" and add:
   ```
   MONGODB_URI = mongodb+srv://your-connection-string
   JWT_SECRET = your-secret-key-here
   FRONTEND_URL = http://localhost:5173
   NODE_ENV = production
   ```
   
   ⚠️ **Important**: Don't set PORT manually - Render provides this automatically

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app
   - This takes 2-5 minutes

6. **Get Your Backend URL**
   - Once deployed, you'll see your URL like: `https://slotswapper-backend.onrender.com`
   - Copy this URL - you'll need it for the frontend

### Option B: Deploy with render.yaml (Advanced)

If you prefer Infrastructure as Code, you can create a `render.yaml` file in the root of your repository.

## ✅ Step 3: Test Your Deployment

1. **Health Check**
   ```bash
   curl https://slotswapper-backend.onrender.com/api/health
   ```
   Should return: `{"status":"ok","message":"SlotSwapper API is running"}`

2. **Test WebSocket** (optional)
   - Your WebSocket server runs on the same URL as your API
   - WebSocket connection: `wss://slotswapper-backend.onrender.com`

## 🔄 Step 4: Update Frontend Configuration

1. **Update Frontend Environment**
   - Open `frontend/.env.production`
   - Replace the URL with your Render URL:
   ```env
   VITE_API_URL=https://slotswapper-backend.onrender.com/api
   ```

2. **Commit and Push**
   ```bash
   git add frontend/.env.production
   git commit -m "Update backend URL for Render deployment"
   git push origin main
   ```

## 🌍 Step 5: Deploy Frontend (Optional - If Not Using Vercel)

You can also deploy the frontend to Render:

1. **Create Another Web Service**
   - Repository: Same `Natraj16/SlotSwapper`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: Leave empty (Render will auto-detect)
   - **Publish Directory**: `dist`

2. **After Frontend Deployment**
   - Get your frontend URL (e.g., `https://slotswapper.onrender.com`)
   - Go back to backend service settings
   - Update `FRONTEND_URL` environment variable with the new URL
   - Trigger a manual redeploy of the backend

## 📊 Monitoring & Logs

- **View Logs**: Click on your service → "Logs" tab
- **Metrics**: See CPU, memory usage in the "Metrics" tab
- **Auto-Deploy**: Render automatically redeploys when you push to GitHub

## ⚙️ Important Notes

### Free Tier Limitations
- **Spin Down**: Free services spin down after 15 minutes of inactivity
- **Cold Start**: First request after spin down takes 30-60 seconds
- **Upgrade**: Consider paid tier ($7/month) for always-on service

### MongoDB Atlas Whitelist
- Render uses dynamic IPs, so in MongoDB Atlas:
  - Go to Network Access
  - Click "Add IP Address"
  - Select "Allow Access from Anywhere" (0.0.0.0/0)
  - Or add Render's IP ranges if you prefer tighter security

### WebSocket Performance
- ✅ **Works on Render** (unlike Vercel free tier)
- Survives service restarts
- Handles multiple concurrent connections

## 🔐 Security Checklist

- ✅ Never commit `.env` files
- ✅ Use strong JWT_SECRET (min 32 characters)
- ✅ Enable HTTPS (Render provides this automatically)
- ✅ Set CORS to specific frontend URL (not wildcard)
- ✅ Keep MongoDB connection string secure

## 🐛 Troubleshooting

### Service Won't Start
- Check logs for errors
- Verify all environment variables are set
- Ensure `backend` is set as root directory

### Database Connection Failed
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check connection string format
- Test connection locally first

### CORS Errors
- Update `FRONTEND_URL` to match your actual frontend domain
- Redeploy backend after changing environment variables

### 404 Errors
- Verify root directory is set to `backend`
- Check that routes start with `/api/`

## 🎉 Success!

Once deployed, your backend will be running at:
```
https://slotswapper-backend.onrender.com
```

Your WebSocket server will be at:
```
wss://slotswapper-backend.onrender.com
```

## 📚 Next Steps

1. Deploy frontend (to Render, Vercel, or Netlify)
2. Update backend `FRONTEND_URL` with frontend domain
3. Test all features (auth, events, swaps, groups)
4. Set up custom domain (optional, available on paid plans)
5. Configure monitoring/alerting
