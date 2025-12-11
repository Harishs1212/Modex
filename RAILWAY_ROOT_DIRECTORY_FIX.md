# Railway Root Directory Fix - CRITICAL

## 🚨 The Problem

Railway is running `cd backend && npm install` and `cd ml-service && pip install`, which means:
- **Root Directory is set to repository root** (wrong!)
- Railway is trying to navigate into subdirectories

## ✅ The Solution

You **MUST** set the Root Directory correctly in Railway dashboard for each service.

### Option 1: Set Root Directory (RECOMMENDED)

#### Backend Service
1. Go to Railway Dashboard
2. Select **Backend Service**
3. Click **Settings** tab
4. Scroll to **"Root Directory"**
5. Set to: `backend` (NOT `Modex/backend` or empty)
6. **Clear** any Build Command (leave empty)
7. **Clear** any Start Command (leave empty, or set to `npm start`)
8. Click **Save**
9. Click **Redeploy**

#### ML Service
1. Go to Railway Dashboard
2. Select **ML Service**
3. Click **Settings** tab
4. Scroll to **"Root Directory"**
5. Set to: `ml-service` (NOT `Modex/ml-service` or empty)
6. **Clear** any Build Command (leave empty)
7. Set Start Command to: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
8. Click **Save**
9. Click **Redeploy**

### Option 2: Use Build Commands (If Root Directory Can't Be Changed)

If Railway won't let you change Root Directory, set these Build Commands:

#### Backend Service
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm start`

#### ML Service
- **Build Command**: `cd ml-service && pip install -r requirements.txt`
- **Start Command**: `cd ml-service && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## 🔍 How to Check Current Settings

1. Go to Railway Dashboard
2. Select your service
3. Click **Settings**
4. Look for **"Root Directory"** field
5. Check **"Build Command"** and **"Start Command"**

## 📋 Step-by-Step Fix

### Backend

1. **Railway Dashboard** → **Backend Service** → **Settings**
2. **Root Directory**: Change to `backend`
3. **Build Command**: Clear it (empty)
4. **Start Command**: Clear it or set to `npm start`
5. **Save**
6. **Redeploy**

### ML Service

1. **Railway Dashboard** → **ML Service** → **Settings**
2. **Root Directory**: Change to `ml-service`
3. **Build Command**: Clear it (empty)
4. **Start Command**: Set to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Save**
6. **Redeploy**

## ✅ Expected Result

After fixing Root Directory:

### Backend Build Logs Should Show:
```
npm install
npm run build
```

**NOT:**
```
cd backend && npm install  ❌
```

### ML Service Build Logs Should Show:
```
pip install -r requirements.txt
```

**NOT:**
```
cd ml-service && pip install  ❌
```

## 🐛 Troubleshooting

### If Root Directory Field is Missing

1. Railway might be using auto-detection
2. Try creating separate Railway projects for each service
3. Or use Build Commands as shown in Option 2

### If Still Getting "npm: not found" or "pip: not found"

1. Check Root Directory is correct
2. Verify `nixpacks.toml` files exist in service directories
3. Check Railway is using NIXPACKS builder (not Docker)
4. Try redeploying from scratch

### If Build Commands Keep Reverting

1. Clear them completely
2. Save settings
3. Redeploy
4. Railway should auto-detect from `nixpacks.toml`

## 📝 Quick Checklist

- [ ] Backend Root Directory = `backend`
- [ ] ML Service Root Directory = `ml-service`
- [ ] Build Commands cleared (empty)
- [ ] Start Commands set correctly
- [ ] Saved settings
- [ ] Redeployed both services
- [ ] Checked logs for errors

## 🎯 Most Important Step

**Set Root Directory correctly!** This is the #1 cause of the errors you're seeing.

The Root Directory tells Railway where your service code lives. If it's wrong, Railway tries to `cd` into directories, which fails because npm/pip aren't available at the root level.

