# Vercel Deployment Guide

## Important: Deploy Backend and Frontend Separately

### Step 1: Deploy Backend First

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. **Root Directory**: Set to `backend`
5. **Framework Preset**: Other
6. **Build Command**: Leave empty
7. **Output Directory**: Leave empty
8. **Environment Variables**: Add these:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=https://your-frontend-app.vercel.app
   ```
9. Click "Deploy"
10. Copy your deployed backend URL (e.g., `https://slotswapper-backend.vercel.app`)

### Step 2: Deploy Frontend

1. Go to Vercel Dashboard again
2. Click "Add New" → "Project"
3. Import the SAME GitHub repository
4. **Root Directory**: Set to `frontend`
5. **Framework Preset**: Vite
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist`
8. **Environment Variables**: Add this:
   ```
   VITE_API_URL=https://your-backend-url.vercel.app/api
   ```
   (Use the backend URL from Step 1)
9. Click "Deploy"

### Step 3: Update Backend FRONTEND_URL

1. Go to your backend project settings on Vercel
2. Go to "Settings" → "Environment Variables"
3. Update `FRONTEND_URL` to your deployed frontend URL
4. Redeploy the backend

### Common Issues

**404 Error**: 
- Frontend: Make sure `vercel.json` exists in frontend folder
- Backend: Make sure `vercel.json` exists in backend folder

**CORS Error**:
- Check that `FRONTEND_URL` in backend matches your frontend URL exactly
- No trailing slash in URLs

**API Connection Failed**:
- Check that `VITE_API_URL` in frontend points to correct backend URL
- Make sure backend is deployed and running

**MongoDB Connection Error**:
- Verify `MONGODB_URI` is correct in backend environment variables
- Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### Testing Deployment

1. Open your frontend URL
2. Open browser console (F12)
3. Try to signup/login
4. Check Network tab for API calls
5. Verify they're going to your backend URL

### Local Development Still Works

Your local setup with `npm run dev` will continue to work:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
