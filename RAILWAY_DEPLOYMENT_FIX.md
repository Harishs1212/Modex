# Railway Deployment Fix Guide

## Issues Fixed

### 1. Backend: "Script start.sh not found"
**Problem**: Railway was looking for a start.sh script that doesn't exist.

**Solution**: 
- Created `backend/nixpacks.toml` for explicit build configuration
- Updated `backend/railway.json` to use NIXPACKS auto-detection
- Railway will now use `npm start` from package.json

### 2. ML Service: "pip: not found"
**Problem**: Railway wasn't detecting Python properly, causing pip to fail.

**Solution**:
- Created `ml-service/runtime.txt` to specify Python 3.11
- Created `ml-service/nixpacks.toml` for explicit Python setup
- Updated `ml-service/railway.json` to use NIXPACKS auto-detection

## Railway Configuration

### Backend Service Settings

1. **Root Directory**: `backend`
2. **Build Command**: (Auto-detected from nixpacks.toml)
3. **Start Command**: `npm start` (or auto-detected)

### ML Service Settings

1. **Root Directory**: `ml-service`
2. **Build Command**: (Auto-detected from nixpacks.toml)
3. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Steps to Fix in Railway Dashboard

### Backend

1. Go to your backend service in Railway
2. Click **Settings**
3. Ensure **Root Directory** is set to: `backend`
4. **Build Command**: Leave empty (will use nixpacks.toml)
5. **Start Command**: `npm start` (or leave empty for auto-detection)
6. Redeploy

### ML Service

1. Go to your ML service in Railway
2. Click **Settings**
3. Ensure **Root Directory** is set to: `ml-service`
4. **Build Command**: Leave empty (will use nixpacks.toml)
5. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Redeploy

## Files Created/Updated

### Backend
- ✅ `backend/nixpacks.toml` - Explicit build configuration
- ✅ `backend/railway.json` - Simplified configuration

### ML Service
- ✅ `ml-service/runtime.txt` - Python version specification
- ✅ `ml-service/nixpacks.toml` - Explicit Python build configuration
- ✅ `ml-service/railway.json` - Simplified configuration

## Verification

After redeploying, check:

1. **Backend logs** should show:
   ```
   Server running on port 3000
   API Documentation: http://localhost:3000/api-docs
   ```

2. **ML Service logs** should show:
   ```
   Application startup complete
   Uvicorn running on http://0.0.0.0:8000
   ```

3. **Health checks**:
   ```bash
   curl https://[YOUR-BACKEND].railway.app/health
   curl https://[YOUR-ML-SERVICE].railway.app/health
   ```

## Troubleshooting

### If Backend Still Fails

1. Check **Root Directory** is `backend` (not `Modex/backend`)
2. Verify `package.json` exists in root directory
3. Check build logs for npm errors
4. Ensure all environment variables are set

### If ML Service Still Fails

1. Check **Root Directory** is `ml-service` (not `Modex/ml-service`)
2. Verify `requirements.txt` exists
3. Check that model files exist:
   - `pregnancy_risk_model.pkl`
   - `scaler.pkl`
   - `label_encoder.pkl`
4. Check build logs for pip errors

### Common Issues

**Issue**: "Module not found"
- **Solution**: Check `requirements.txt` includes all dependencies

**Issue**: "Model file not found"
- **Solution**: Ensure model files are in `ml-service/` directory

**Issue**: "Port already in use"
- **Solution**: Railway sets `$PORT` automatically, don't hardcode it

## Next Steps

1. ✅ Fix Root Directory settings in Railway
2. ✅ Redeploy both services
3. ✅ Verify health endpoints
4. ✅ Test API endpoints
5. ✅ Update environment variables with service URLs

