# Update DATABASE_URL in Railway

## ✅ Your Connection Pooler URL

```
postgresql://postgres.laundtxtugquuyscvgzv:ModexHealthcare%4012@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

This is **correct**! It's using:
- ✅ Connection pooler (not direct connection)
- ✅ URL-encoded password (`%40` = `@`)
- ✅ Correct format for Railway

## 📋 Steps to Update

### Step 1: Go to Railway Dashboard

1. Go to **Railway Dashboard** → **Backend Service**
2. Click **"Variables"** tab

### Step 2: Update DATABASE_URL

1. Find `DATABASE_URL` in the environment variables list
2. Click **"Edit"** or **"Update"**
3. Replace the value with:
   ```
   postgresql://postgres.laundtxtugquuyscvgzv:ModexHealthcare%4012@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
4. Click **"Save"**

### Step 3: Redeploy Backend

After saving:
1. Railway will **automatically redeploy** the backend
2. Or manually trigger redeploy: **Deployments** → **Redeploy**

### Step 4: Wait for Deployment

Wait for the deployment to complete (usually 1-2 minutes).

### Step 5: Check Logs

After deployment, check Railway logs:
- Should see: "Prisma Client Connected" ✅
- Should NOT see: "Can't reach database server" ❌

### Step 6: Test Login

Try logging in from your Vercel frontend again.

## 🧪 Verify Connection

After redeploy, test:

```bash
# Health check
curl https://neocaresync-backend-production-a312.up.railway.app/health

# Should return: {"status":"ok","timestamp":"..."}
```

## 📝 Important Notes

- **Password is URL-encoded**: `ModexHealthcare%4012` (correct!)
- **Using pooler**: Port `6543` (correct for pooler)
- **Region**: `ap-southeast-1` (your Supabase region)

## ✅ Expected Result

After updating and redeploying:
- ✅ Database connection should work
- ✅ No more "Can't reach database server" errors
- ✅ Login should work (if migrations are run)

## 🔄 If Still Getting 500 Error

After updating DATABASE_URL, if you still get 500:

1. **Check Railway logs** - Look for new errors
2. **Run migrations** (if tables don't exist):
   ```bash
   # In Railway shell
   cd backend
   npx prisma migrate deploy
   npx prisma generate
   ```

## 🎯 Next Steps

1. ✅ Update `DATABASE_URL` in Railway (use the pooler URL above)
2. ✅ Wait for auto-redeploy
3. ✅ Check logs for connection success
4. ✅ Test login from frontend

After this update, the database connection should work!

