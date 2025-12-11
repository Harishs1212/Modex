# Fix Vercel Environment Variable - CRITICAL

## 🚨 The Problem

The frontend is making requests to:
```
https://modex-liart.vercel.app/neocaresync-backend-production-a312.up.railway.app/api/users/login
```

This is **WRONG**! It's trying to go through Vercel instead of directly to Railway.

## ✅ The Solution

The `VITE_API_URL` environment variable in Vercel is incorrect or missing.

### Step 1: Fix Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `VITE_API_URL` (or create it if missing)
3. Set it to:
   ```
   https://neocaresync-backend-production-a312.up.railway.app
   ```
   
   **Important:**
   - Must start with `https://`
   - Must NOT have trailing slash
   - Must be the Railway backend URL directly
   - Must start with `VITE_` prefix

### Step 2: Redeploy Frontend

After updating the environment variable:
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger auto-deploy

### Step 3: Verify

After redeploy, check browser console:
- Request URL should be: `https://neocaresync-backend-production-a312.up.railway.app/api/users/login`
- NOT: `https://modex-liart.vercel.app/...`

## 🔍 How to Check Current Value

In Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Look for `VITE_API_URL`
3. Current value might be:
   - Missing (not set)
   - Wrong format (relative URL)
   - Has trailing slash
   - Missing `https://`

## ✅ Correct Format

```bash
VITE_API_URL=https://neocaresync-backend-production-a312.up.railway.app
```

**NOT:**
- ❌ `neocaresync-backend-production-a312.up.railway.app` (missing https://)
- ❌ `https://neocaresync-backend-production-a312.up.railway.app/` (trailing slash)
- ❌ `/api` (relative path)
- ❌ `http://localhost:3000` (wrong for production)

## 🧪 Test After Fix

1. Open Vercel frontend
2. Open DevTools → Network tab
3. Try to login
4. Check the request URL - should go directly to Railway, not through Vercel

## 📋 Quick Checklist

- [ ] `VITE_API_URL` set in Vercel environment variables
- [ ] Value is: `https://neocaresync-backend-production-a312.up.railway.app`
- [ ] No trailing slash
- [ ] Starts with `https://`
- [ ] Starts with `VITE_` prefix
- [ ] Frontend redeployed after change
- [ ] Tested login - request goes to Railway directly

