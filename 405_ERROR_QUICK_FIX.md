# Quick Fix for 405 Error in Vercel

## 🚨 The Problem

405 "Method Not Allowed" error typically means:
- **CORS preflight (OPTIONS) failing** - Most common cause
- Backend not allowing your Vercel frontend URL
- Environment variables not set correctly

## ✅ Quick Fix (2 Steps)

### Step 1: Set Backend Environment Variable

**In Railway/Render → Backend Service → Environment Variables:**

Add/Update:
```bash
FRONTEND_URL=https://[YOUR-VERCEL-APP].vercel.app
```

**Replace `[YOUR-VERCEL-APP]` with your actual Vercel domain!**

Example:
```bash
FRONTEND_URL=https://neocaresync-abc123.vercel.app
```

### Step 2: Redeploy Backend

After setting the environment variable:
1. **Save** the environment variable
2. **Redeploy** the backend service
3. Wait for deployment to complete

## 🔍 Verify Frontend Environment Variable

**In Vercel → Your Project → Settings → Environment Variables:**

Make sure you have:
```bash
VITE_API_URL=https://[YOUR-BACKEND].railway.app
```

**Important**: 
- Must start with `VITE_` prefix
- Should be your Railway backend URL
- No trailing slash

## 🧪 Test After Fix

1. Open your Vercel frontend
2. Open browser DevTools (F12)
3. Go to **Network** tab
4. Try to login
5. Check if the request succeeds (should be 200, not 405)

## 🐛 If Still Getting 405

### Check Browser Console

Look for CORS errors like:
- "Access to XMLHttpRequest blocked by CORS policy"
- "No 'Access-Control-Allow-Origin' header"

### Check Backend Logs

In Railway/Render logs, look for:
- CORS warnings
- The origin being blocked

### Test Backend Directly

```bash
# Replace with your backend URL
curl -X POST https://[YOUR-BACKEND].railway.app/api/users/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://[YOUR-VERCEL-APP].vercel.app" \
  -d '{"email":"admin@neocaresync.com","password":"admin123"}'
```

## 📋 Checklist

- [ ] `FRONTEND_URL` set in Railway/Render backend
- [ ] `VITE_API_URL` set in Vercel frontend
- [ ] Backend redeployed after env var change
- [ ] Frontend redeployed after env var change
- [ ] Tested login from Vercel frontend
- [ ] Checked browser console for errors

## 💡 What Changed

I've updated `backend/src/server.ts` to:
- Handle CORS preflight (OPTIONS) requests properly
- Support multiple origins (local dev + production)
- Better CORS error logging

After you set `FRONTEND_URL` and redeploy, the 405 error should be fixed!

