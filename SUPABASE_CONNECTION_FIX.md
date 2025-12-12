# Fix "Tenant or user not found" Error

## 🚨 Error

```
FATAL: Tenant or user not found
```

This means the database user/tenant in the connection string is incorrect.

## 🔍 Possible Issues

### Issue 1: Wrong Username Format

The pooler connection string format should be:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Check:**
- Username should be: `postgres.laundtxtugquuyscvgzv` (with dot)
- NOT: `postgres` alone

### Issue 2: Wrong Password

The password might be incorrect or not URL-encoded properly.

### Issue 3: Wrong Connection Mode

Try **Session mode** instead of Transaction mode, or use **direct connection**.

## ✅ Solutions

### Solution 1: Verify Connection String in Supabase

1. Go to **Supabase Dashboard** → **Settings** → **Database**
2. Scroll to **"Connection Pooling"**
3. Check **both** modes:
   - **Transaction mode** (port 6543)
   - **Session mode** (port 5432)
4. Copy the **exact** connection string from Supabase (don't type it manually)

### Solution 2: Try Session Mode Instead

If Transaction mode doesn't work, try Session mode:

1. In Supabase → **Connection Pooling** → **Session mode**
2. Copy that connection string
3. It will look like:
   ```
   postgresql://postgres.laundtxtugquuyscvgzv:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
   ```
   (Note: Port is `5432` for Session mode, not `6543`)

### Solution 3: Use Direct Connection (Temporary)

If pooler doesn't work, try direct connection:

1. In Supabase → **Settings** → **Database** → **Connection string**
2. Copy the **direct connection** string (not pooler)
3. Format:
   ```
   postgresql://postgres:[PASSWORD]@db.laundtxtugquuyscvgzv.supabase.co:5432/postgres
   ```
4. Make sure password is URL-encoded

### Solution 4: Verify Password

1. Go to Supabase Dashboard
2. **Settings** → **Database**
3. Click **"Reset database password"** if needed
4. Copy the new password
5. URL-encode it if it has special characters:
   - `@` → `%40`
   - `#` → `%23`
   - `%` → `%25`

## 🧪 Test Connection String

Before updating in Railway, test locally:

```bash
# Test with psql (if you have it)
psql "postgresql://postgres.laundtxtugquuyscvgzv:ModexHealthcare%4012@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# Or test with Prisma
cd backend
export DATABASE_URL="postgresql://postgres.laundtxtugquuyscvgzv:ModexHealthcare%4012@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
npx prisma db pull
```

## 📋 Recommended: Get Fresh Connection String

1. **Supabase Dashboard** → **Settings** → **Database**
2. Scroll to **"Connection Pooling"**
3. Click **"Transaction"** mode
4. Click **"Copy"** button (don't type manually)
5. Paste directly into Railway `DATABASE_URL`

This ensures you get the exact format Supabase expects.

## 🔄 Alternative: Use Direct Connection

If pooler continues to fail, use direct connection:

1. Supabase → **Settings** → **Database**
2. Scroll to **"Connection string"** (not Connection Pooling)
3. Copy the URI format
4. Update `DATABASE_URL` in Railway

**Note:** Direct connection works but pooler is better for production.

## ✅ After Updating

1. Update `DATABASE_URL` in Railway
2. Wait for redeploy
3. Check logs - should see "Prisma Client Connected"
4. Test login

## 🎯 Most Likely Fix

**Get a fresh connection string from Supabase dashboard** - don't type it manually. The exact format matters!

