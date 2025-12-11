# Fix Database Connection Error

## 🚨 Error Found

```
Can't reach database server at `db.laundtxtugquuyscvgzv.supabase.co:5432`
```

## ✅ Solutions

### Solution 1: Use Supabase Connection Pooler (RECOMMENDED)

Supabase provides a **connection pooler** that's better for serverless/server environments like Railway.

**Steps:**

1. Go to **Supabase Dashboard** → Your Project → **Settings** → **Database**
2. Scroll to **"Connection Pooling"** section
3. Copy the **"Connection string"** from **"Transaction"** or **"Session"** mode
4. Format will be:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   OR
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```

5. Update `DATABASE_URL` in Railway → Backend → Variables with the pooler URL

**Why use pooler?**
- Better for serverless/server environments
- Handles connection limits better
- More reliable for Railway deployments

### Solution 2: Check Direct Connection

If using direct connection, verify:

1. **Connection String Format:**
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

2. **Password URL Encoding:**
   - If password has special characters, they must be URL-encoded
   - `@` becomes `%40`
   - Example: `ModexHealthcare@12` → `ModexHealthcare%4012`

3. **Check Supabase Database Status:**
   - Go to Supabase Dashboard
   - Verify database is running (not paused)
   - Check if there are any connection limits

### Solution 3: Enable Direct Connections (If Pooler Doesn't Work)

1. Go to Supabase Dashboard → **Settings** → **Database**
2. Check **"Allow direct connections"** is enabled
3. Verify firewall rules allow connections from Railway IPs

## 🔧 Fixed Issues

I've also fixed the Express trust proxy issue by adding:
```typescript
app.set('trust proxy', true);
```

This is required for Railway/Render deployments.

## 📋 Quick Fix Steps

### Step 1: Get Connection Pooler URL

1. Supabase Dashboard → Settings → Database
2. Scroll to "Connection Pooling"
3. Copy "Transaction" mode connection string
4. It will look like:
   ```
   postgresql://postgres.laundtxtugquuyscvgzv:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### Step 2: Update Railway Environment Variable

1. Railway → Backend Service → Variables
2. Update `DATABASE_URL` with pooler connection string
3. Make sure password is URL-encoded if it has special characters

### Step 3: Redeploy Backend

After updating `DATABASE_URL`:
1. Railway will auto-redeploy
2. Or manually trigger redeploy
3. Check logs - should see "Prisma Client Connected" instead of connection errors

## 🧪 Test Connection

After updating, test:

```bash
# Test health endpoint
curl https://neocaresync-backend-production-a312.up.railway.app/health

# Test login
curl -X POST https://neocaresync-backend-production-a312.up.railway.app/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@neocaresync.com","password":"admin123"}'
```

## 📝 Connection String Examples

### Direct Connection (Current - Not Working)
```
postgresql://postgres:ModexHealthcare%4012@db.laundtxtugquuyscvgzv.supabase.co:5432/postgres
```

### Connection Pooler (Recommended)
```
postgresql://postgres.laundtxtugquuyscvgzv:ModexHealthcare%4012@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

**Note:** Replace `[REGION]` with your actual Supabase region (e.g., `us-west-1`, `us-east-1`)

## 🎯 Most Likely Solution

**Use Supabase Connection Pooler!** It's designed for serverless/server environments and will solve the connection issue.

## ✅ After Fix

You should see in Railway logs:
- ✅ "Prisma Client Connected"
- ✅ "Server running on port 3000"
- ✅ No database connection errors

Then login should work!

