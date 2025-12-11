# Railway Settings Screenshot Guide

## Where to Find Root Directory Setting

### Step 1: Navigate to Service
1. Go to https://railway.app
2. Select your project
3. Click on **Backend Service** (or ML Service)

### Step 2: Open Settings
1. Click on **"Settings"** tab (top of the page)
2. Scroll down to find **"Root Directory"** field

### Step 3: Set Root Directory

**For Backend:**
- Current (WRONG): Empty or `Modex` or repository root
- Should be: `backend`

**For ML Service:**
- Current (WRONG): Empty or `Modex` or repository root  
- Should be: `ml-service`

### Step 4: Clear Build Commands

**Build Command**: Leave **EMPTY** (Railway will use nixpacks.toml)

**Start Command**: 
- Backend: `npm start` or empty
- ML Service: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Visual Guide

```
Railway Dashboard
├── Your Project
    ├── Backend Service
    │   └── Settings Tab
    │       ├── Root Directory: [backend] ← SET THIS
    │       ├── Build Command: [empty] ← CLEAR THIS
    │       └── Start Command: [npm start] ← SET THIS
    │
    └── ML Service
        └── Settings Tab
            ├── Root Directory: [ml-service] ← SET THIS
            ├── Build Command: [empty] ← CLEAR THIS
            └── Start Command: [uvicorn app.main:app --host 0.0.0.0 --port $PORT] ← SET THIS
```

## Quick Fix Commands

If you can't find the settings, try these in Railway CLI:

```bash
# For Backend
railway service
railway variables
# Then set root directory in dashboard
```

