# Diagnose 500 Error - Step by Step

## 🔍 Current Status

- ✅ URL is correct
- ✅ Database URL looks correct
- ❌ Still getting 500 error

## 📋 Check Railway Logs (MOST IMPORTANT)

The logs will show the **exact error**. Please check:

1. **Railway Dashboard** → **Backend Service** → **Logs** tab
2. Look for errors when you try to login
3. **Copy the exact error message** - it will tell us what's wrong

## 🎯 Most Likely Causes (in order)

### 1. Database Migrations Not Run (90% likely)

**Error in logs:** "Table 'users' does not exist" or "relation 'users' does not exist"

**Fix:**
```bash
# In Railway → Backend → Deployments → Latest → Shell
cd backend
npx prisma migrate deploy
npx prisma generate
```

### 2. Missing JWT_SECRET (5% likely)

**Error in logs:** "JWT_SECRET is required" or "secretOrPrivateKey must have a value"

**Fix:**
In Railway → Backend → Variables:
```bash
JWT_SECRET=[GENERATE-32-CHAR-SECRET]
```

Generate:
```bash
openssl rand -base64 32
```

### 3. Database Connection Still Failing (3% likely)

**Error in logs:** "Can't reach database server" or "PrismaClientInitializationError"

**Fix:**
- Verify `DATABASE_URL` is correct
- Try direct connection instead of pooler
- Check Supabase database is running (not paused)

### 4. Prisma Client Not Generated (2% likely)

**Error in logs:** "Cannot find module '@prisma/client'"

**Fix:**
```bash
# In Railway shell
cd backend
npx prisma generate
```

## 🧪 Quick Diagnostic Tests

### Test 1: Check Health Endpoint

```bash
curl https://neocaresync-backend-production-a312.up.railway.app/health
```

**Expected:** `{"status":"ok","timestamp":"..."}`

### Test 2: Check Login Endpoint (See Error)

```bash
curl -X POST https://neocaresync-backend-production-a312.up.railway.app/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neocaresync.com","password":"admin123"}' \
  -v
```

**Check the response body** - it should show the error message.

### Test 3: Check Database Connection

In Railway shell:
```bash
cd backend
npx prisma db pull
```

If this fails, database connection is the issue.

## 📋 Environment Variables Checklist

Verify these are set in Railway → Backend → Variables:

- [ ] `DATABASE_URL` - Supabase connection string (pooler or direct)
- [ ] `JWT_SECRET` - 32+ character secret
- [ ] `JWT_ACCESS_EXPIRY` - `15m`
- [ ] `JWT_REFRESH_EXPIRY` - `7d`
- [ ] `FRONTEND_URL` - `https://modex-liart.vercel.app`
- [ ] `NODE_ENV` - `production`
- [ ] `PORT` - `3000`

## 🔧 Most Likely Fix: Run Migrations

Based on the error pattern, **most likely the database tables don't exist yet**.

**In Railway → Backend → Deployments → Latest → Shell:**

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

This will:
1. Create all database tables
2. Generate Prisma client
3. Should fix the 500 error

## 📝 Action Plan

1. **Check Railway logs** - Find the exact error message
2. **Run migrations** - `npx prisma migrate deploy` (most likely fix)
3. **Verify JWT_SECRET** - Make sure it's set
4. **Test again** - Try login from frontend

## 💡 Pro Tip

**The Railway logs will show the exact error!** Common errors:

- `Table 'users' does not exist` → Run migrations
- `JWT_SECRET is required` → Set JWT_SECRET
- `Can't reach database server` → Fix DATABASE_URL
- `Cannot find module '@prisma/client'` → Run `npx prisma generate`

**Share the error from Railway logs and I can provide the exact fix!**

