# Railway Quick Fix Guide

## 🚨 Current Issues

1. **Backend**: "Script start.sh not found" ❌
2. **ML Service**: "pip: not found" ❌

## ✅ Solutions Applied

I've created configuration files to fix both issues. Now you need to:

### Step 1: Verify Root Directory Settings

#### Backend Service
1. Go to Railway Dashboard → Backend Service → **Settings**
2. **Root Directory**: Must be `backend` (NOT `Modex/backend` or empty)
3. Save

#### ML Service  
1. Go to Railway Dashboard → ML Service → **Settings**
2. **Root Directory**: Must be `ml-service` (NOT `Modex/ml-service` or empty)
3. Save

### Step 2: Clear Build Commands (Let NIXPACKS Auto-Detect)

#### Backend
- **Build Command**: Leave **EMPTY** (will use `nixpacks.toml`)
- **Start Command**: Leave **EMPTY** or set to `npm start`

#### ML Service
- **Build Command**: Leave **EMPTY** (will use `nixpacks.toml`)
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Step 3: Redeploy

1. Click **"Redeploy"** on both services
2. Or push a new commit to trigger auto-deploy

## 📋 Files Created

### Backend
- ✅ `backend/nixpacks.toml` - Build configuration
- ✅ `backend/railway.json` - Updated

### ML Service
- ✅ `ml-service/runtime.txt` - Python 3.11 specification
- ✅ `ml-service/nixpacks.toml` - Python build configuration
- ✅ `ml-service/railway.json` - Updated

## 🔍 Verify Model Files

Make sure these files exist in `ml-service/` directory:
- `pregnancy_risk_model.pkl`
- `scaler.pkl`
- `label_encoder.pkl`

If they're missing, copy them from the root `artifacts/` folder or `Modex/` directory.

## ✅ Expected Results

After redeploy:

### Backend Logs Should Show:
```
Server running on port 3000
API Documentation: http://localhost:3000/api-docs
```

### ML Service Logs Should Show:
```
Application startup complete
Uvicorn running on http://0.0.0.0:8000
```

## 🐛 If Still Failing

### Backend Issues
1. Check Root Directory is exactly `backend`
2. Verify `package.json` exists
3. Check build logs for npm errors

### ML Service Issues
1. Check Root Directory is exactly `ml-service`
2. Verify `requirements.txt` exists
3. Check model files are present
4. Check build logs for Python/pip errors

## 📞 Quick Checklist

- [ ] Backend Root Directory = `backend`
- [ ] ML Service Root Directory = `ml-service`
- [ ] Build Commands cleared (empty)
- [ ] Model files exist in `ml-service/`
- [ ] Redeployed both services
- [ ] Checked logs for errors

