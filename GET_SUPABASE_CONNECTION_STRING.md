# How to Get Supabase Connection String

## 📍 Where to Find the Connection String

You're currently on the **Connection Pooling configuration** page. The connection string is in a **different section**.

## 🔍 Step-by-Step Guide

### Step 1: Go to Database Settings

1. In Supabase Dashboard, you should be at: **Settings** → **Database**
2. You're currently on the **"Connection Pooling"** tab/section

### Step 2: Find Connection String Section

Look for one of these sections on the same page:

#### Option A: Connection String (Direct Connection)
- Scroll up or look for **"Connection string"** section
- This shows the direct database connection (not pooler)
- Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

#### Option B: Connection Pooling Connection Strings
- Look for **"Connection string"** within the Connection Pooling section
- Or look for tabs/buttons that say:
  - **"Transaction"** mode
  - **"Session"** mode
- Click on one of these to see the connection string

### Step 3: Copy the Connection String

Once you find it:
1. You'll see a connection string like:
   ```
   postgresql://postgres.laundtxtugquuyscvgzv:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
2. Click the **"Copy"** button (usually a clipboard icon)
3. **Don't type it manually** - copy it exactly

## 🎯 Visual Guide

The Supabase Database settings page typically has:

```
Settings → Database
├── Connection string (Direct connection)
│   └── URI format: postgresql://postgres:...
│
├── Connection Pooling
│   ├── Configuration (what you're seeing)
│   └── Connection string (what you need!)
│       ├── Transaction mode: postgresql://postgres.[PROJECT]:...@pooler...:6543/...
│       └── Session mode: postgresql://postgres.[PROJECT]:...@pooler...:5432/...
```

## 🔄 Alternative: Use Direct Connection

If you can't find the pooler connection string:

1. Use the **"Connection string"** section (direct connection)
2. Copy the URI format
3. It will be:
   ```
   postgresql://postgres:[PASSWORD]@db.laundtxtugquuyscvgzv.supabase.co:5432/postgres
   ```
4. Make sure password is URL-encoded (`@` → `%40`)

## 📋 What You Need

For Railway, you need the **full connection string** that looks like:

**Transaction Mode (Pooler):**
```
postgresql://postgres.laundtxtugquuyscvgzv:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**Session Mode (Pooler):**
```
postgresql://postgres.laundtxtugquuyscvgzv:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**Direct Connection:**
```
postgresql://postgres:[PASSWORD]@db.laundtxtugquuyscvgzv.supabase.co:5432/postgres
```

## 💡 Quick Tip

If you can't find the pooler connection string:
1. Use **direct connection** for now (it will work)
2. The connection string is usually shown with a **"Copy"** button
3. Look for text that starts with `postgresql://`

## ✅ After Getting the Connection String

1. Copy it exactly (including password)
2. If password has `@`, make sure it's URL-encoded as `%40`
3. Paste into Railway → Backend → Variables → `DATABASE_URL`
4. Save and redeploy

