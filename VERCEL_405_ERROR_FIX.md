# Fix 405 Error in Vercel Frontend

## 🚨 Problem: 405 Method Not Allowed

This error typically occurs due to:
1. **CORS configuration** - Backend not allowing Vercel frontend URL
2. **OPTIONS preflight** - CORS preflight request failing
3. **Backend URL mismatch** - Frontend calling wrong backend URL

## ✅ Solution

### Step 1: Update Backend CORS Configuration

The backend needs to allow your Vercel frontend URL. Update Railway/Render environment variables:

**In Railway/Render Backend Service → Environment Variables:**

```bash
FRONTEND_URL=https://[YOUR-VERCEL-APP].vercel.app
```

**Important**: Replace `[YOUR-VERCEL-APP]` with your actual Vercel domain.

### Step 2: Verify Frontend API URL

**In Vercel → Environment Variables:**

```bash
VITE_API_URL=https://[YOUR-BACKEND].railway.app
```

**Important**: 
- Must start with `VITE_` prefix
- Should be your Railway backend URL (not localhost)
- No trailing slash

### Step 3: Update Backend CORS to Allow Multiple Origins

If you need to support both local development and production, update the backend CORS configuration.

**File**: `backend/src/server.ts`

Current code:
```typescript
app.use(cors({
  origin: config.cors.frontendUrl,
  credentials: true,
}));
```

Update to allow multiple origins:
```typescript
const allowedOrigins = [
  config.cors.frontendUrl,
  'http://localhost:5173', // Local development
  'https://[YOUR-VERCEL-APP].vercel.app', // Production
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Step 4: Handle OPTIONS Preflight Requests

Add explicit OPTIONS handler:

```typescript
// Before routes
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});
```

## 🔍 Debugging Steps

### 1. Check Browser Console

Open browser DevTools → Network tab:
- Look for the failed request
- Check the Request URL
- Check Request Method (should be POST for login)
- Check Response Headers

### 2. Check Backend Logs

In Railway/Render logs, look for:
- CORS errors
- 405 errors
- Request method and URL

### 3. Test Backend Directly

```bash
# Test health endpoint
curl https://[YOUR-BACKEND].railway.app/health

# Test login endpoint
curl -X POST https://[YOUR-BACKEND].railway.app/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neocaresync.com","password":"admin123"}'
```

### 4. Check Environment Variables

**Backend (Railway/Render):**
```bash
FRONTEND_URL=https://[YOUR-VERCEL-APP].vercel.app
```

**Frontend (Vercel):**
```bash
VITE_API_URL=https://[YOUR-BACKEND].railway.app
```

## 🐛 Common Issues

### Issue 1: CORS Error in Console
**Solution**: Update `FRONTEND_URL` in backend environment variables

### Issue 2: Network Error
**Solution**: Check `VITE_API_URL` is set correctly in Vercel

### Issue 3: 405 on OPTIONS Request
**Solution**: Add OPTIONS handler (see Step 4 above)

### Issue 4: Backend Not Responding
**Solution**: 
- Check backend is deployed and running
- Check Railway/Render logs
- Verify backend URL is correct

## 📋 Quick Checklist

- [ ] Backend `FRONTEND_URL` set to Vercel URL
- [ ] Frontend `VITE_API_URL` set to Railway backend URL
- [ ] Backend CORS allows Vercel origin
- [ ] Backend is running and accessible
- [ ] Redeployed backend after env var changes
- [ ] Redeployed frontend after env var changes

## 🔧 Quick Fix Script

If you want to update the backend code to handle CORS better, I can create an updated `server.ts` file with improved CORS handling.

