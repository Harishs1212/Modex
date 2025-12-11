# Debug 500 Internal Server Error

## ✅ Progress: URL Fixed!

The request is now going to the correct URL:
```
https://neocaresync-backend-production-a312.up.railway.app/api/users/login
```

But getting **500 Internal Server Error** - this is a backend issue.

## 🔍 Common Causes of 500 Error on Login

### 1. Database Connection Failed
- `DATABASE_URL` not set or incorrect
- Database not accessible
- Connection timeout

### 2. Prisma Client Not Generated
- Prisma client needs to be generated after deployment
- Missing `@prisma/client` in node_modules

### 3. Missing Environment Variables
- `JWT_SECRET` not set
- `DATABASE_URL` not set
- Other required env vars missing

### 4. Database Migrations Not Run
- Tables don't exist
- Schema mismatch

### 5. Code Error
- Exception in login handler
- Missing dependencies

## 🧪 Step-by-Step Debugging

### Step 1: Check Railway Backend Logs

1. Go to **Railway Dashboard** → **Backend Service**
2. Click **"Logs"** tab
3. Look for error messages around the time of the login attempt
4. Common errors:
   - "PrismaClientInitializationError"
   - "Can't reach database server"
   - "JWT_SECRET is required"
   - Stack traces

### Step 2: Test Backend Health

```bash
curl https://neocaresync-backend-production-a312.up.railway.app/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### Step 3: Test Login Endpoint Directly

```bash
curl -X POST https://neocaresync-backend-production-a312.up.railway.app/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neocaresync.com","password":"admin123"}' \
  -v
```

Check the response - it will show the actual error message.

### Step 4: Verify Environment Variables

**In Railway → Backend Service → Variables:**

Required variables:
- ✅ `DATABASE_URL` - Supabase connection string
- ✅ `JWT_SECRET` - Random 32+ character string
- ✅ `JWT_ACCESS_EXPIRY` - e.g., `15m`
- ✅ `JWT_REFRESH_EXPIRY` - e.g., `7d`
- ✅ `FRONTEND_URL` - Your Vercel URL
- ✅ `REDIS_HOST` - Upstash endpoint
- ✅ `REDIS_PORT` - Usually `6379`
- ✅ `REDIS_PASSWORD` - Upstash password
- ✅ `ML_SERVICE_URL` - ML service URL
- ✅ `NODE_ENV` - Should be `production`

### Step 5: Check Database Connection

In Railway logs, look for:
- "Prisma Client Connected"
- Database connection errors
- Migration errors

### Step 6: Verify Prisma Client Generated

After deployment, Prisma client should be generated. Check Railway build logs for:
- "Generated Prisma Client"
- Any Prisma errors

## 🔧 Quick Fixes

### Fix 1: Run Database Migrations

If migrations haven't been run:

```bash
# In Railway → Backend Service → Deployments → Latest → Shell
npx prisma migrate deploy
npx prisma generate
```

### Fix 2: Generate Prisma Client

```bash
# In Railway shell
cd backend
npx prisma generate
```

### Fix 3: Check JWT_SECRET

Make sure `JWT_SECRET` is set and is at least 32 characters:

```bash
# Generate a new one if needed
openssl rand -base64 32
```

### Fix 4: Verify Database URL Format

The `DATABASE_URL` should be:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

Make sure password is URL-encoded if it has special characters.

## 📋 Most Likely Issues

Based on common deployment issues:

1. **Database migrations not run** (80% likely)
   - Solution: Run `npx prisma migrate deploy` in Railway shell

2. **Prisma client not generated** (15% likely)
   - Solution: Run `npx prisma generate` in Railway shell

3. **Missing JWT_SECRET** (5% likely)
   - Solution: Set `JWT_SECRET` environment variable

## 🎯 Next Steps

1. **Check Railway logs** - This will show the exact error
2. **Run migrations** if needed
3. **Verify all environment variables** are set
4. **Test health endpoint** to confirm backend is running
5. **Test login endpoint** with curl to see error message

## 💡 Pro Tip

The Railway logs will show the exact error. Look for:
- Stack traces
- Error messages
- Database connection errors
- Missing environment variable warnings

Share the error from Railway logs and I can help fix it specifically!

