# Fix 500 Error - Railway Backend

## ✅ Progress: URL Fixed!

The request is now correctly going to:
```
https://neocaresync-backend-production-a312.up.railway.app/api/users/login
```

## 🚨 500 Internal Server Error

This means the backend received the request but crashed while processing it.

## 🔍 Check Railway Logs (MOST IMPORTANT)

1. Go to **Railway Dashboard** → **Backend Service**
2. Click **"Logs"** tab
3. Look for errors around the time of login attempt
4. **Share the error message** - it will tell us exactly what's wrong

## 🎯 Most Common Causes (in order)

### 1. Database Migrations Not Run (90% likely)

**Symptoms:**
- Error: "Table 'users' does not exist"
- Error: "relation 'users' does not exist"
- Prisma errors about missing tables

**Fix:**
```bash
# In Railway → Backend Service → Deployments → Latest → Shell
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 2. Prisma Client Not Generated (5% likely)

**Symptoms:**
- Error: "Cannot find module '@prisma/client'"
- Error: "Prisma Client is not generated"

**Fix:**
```bash
# In Railway shell
cd backend
npx prisma generate
```

### 3. Missing JWT_SECRET (3% likely)

**Symptoms:**
- Error: "JWT_SECRET is required"
- Error: "secretOrPrivateKey must have a value"

**Fix:**
In Railway → Backend → Variables:
```bash
JWT_SECRET=[GENERATE-A-32-CHAR-SECRET]
```

Generate secret:
```bash
openssl rand -base64 32
```

### 4. Database Connection Failed (2% likely)

**Symptoms:**
- Error: "Can't reach database server"
- Error: "PrismaClientInitializationError"
- Error: "Connection refused"

**Fix:**
- Verify `DATABASE_URL` is correct in Railway variables
- Check Supabase database is running
- Verify connection string format

## 🧪 Quick Tests

### Test 1: Health Endpoint

```bash
curl https://neocaresync-backend-production-a312.up.railway.app/health
```

Should return: `{"status":"ok","timestamp":"..."}`

If this fails, backend isn't running properly.

### Test 2: Login Endpoint (See Error)

```bash
curl -X POST https://neocaresync-backend-production-a312.up.railway.app/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neocaresync.com","password":"admin123"}' \
  -v
```

This will show the actual error message in the response.

## 📋 Environment Variables Checklist

Verify these are set in Railway → Backend → Variables:

- [ ] `DATABASE_URL` - Supabase connection string
- [ ] `JWT_SECRET` - 32+ character secret
- [ ] `JWT_ACCESS_EXPIRY` - e.g., `15m`
- [ ] `JWT_REFRESH_EXPIRY` - e.g., `7d`
- [ ] `FRONTEND_URL` - Vercel URL
- [ ] `REDIS_HOST` - Upstash endpoint
- [ ] `REDIS_PORT` - `6379`
- [ ] `REDIS_PASSWORD` - Upstash password
- [ ] `ML_SERVICE_URL` - ML service URL
- [ ] `NODE_ENV` - `production`
- [ ] `PORT` - `3000`

## 🔧 Step-by-Step Fix

### Step 1: Check Logs
- Go to Railway → Backend → Logs
- Find the error message
- Note the exact error

### Step 2: Run Migrations (Most Likely Fix)

In Railway → Backend → Deployments → Latest → Shell:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### Step 3: Verify Environment Variables

Check all required variables are set (see checklist above).

### Step 4: Test Again

Try login from frontend or test with curl.

## 💡 Pro Tip

**The Railway logs will show the exact error!** 

Common errors you might see:
- `PrismaClientInitializationError` → Database connection issue
- `Table 'users' does not exist` → Run migrations
- `JWT_SECRET is required` → Set JWT_SECRET variable
- `Cannot find module '@prisma/client'` → Run `npx prisma generate`

## 🎯 Next Steps

1. **Check Railway logs** - This is the most important step!
2. **Run migrations** if tables don't exist
3. **Verify environment variables** are all set
4. **Test health endpoint** to confirm backend is running
5. **Share the error** from logs if you need help

The logs will tell us exactly what's wrong!

