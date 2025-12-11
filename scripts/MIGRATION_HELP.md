# Migration Help - URL Encoding Issue Fixed

## Problem
Passwords with special characters (like `@`, `#`, `%`) need to be URL-encoded in database connection strings.

## Solution
The migration script now automatically encodes passwords. Use one of these methods:

### Method 1: Provide Project Ref and Password Separately (Easiest)
```bash
cd Modex
./scripts/migrate-supabase.sh laundtxtugquuyscvgzv ModexHealthcare@12
```

The script will automatically encode the password.

### Method 2: Provide Full Connection String
```bash
cd Modex
./scripts/migrate-supabase.sh "postgresql://postgres:ModexHealthcare@12@db.laundtxtugquuyscvgzv.supabase.co:5432/postgres"
```

**Important**: Remove brackets `[]` around project ref - they're just placeholders in documentation!

### Method 3: Manual URL Encoding
If you want to manually encode:
- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`
- etc.

Example:
```bash
# Password: ModexHealthcare@12
# Encoded: ModexHealthcare%4012
./scripts/migrate-supabase.sh "postgresql://postgres:ModexHealthcare%4012@db.laundtxtugquuyscvgzv.supabase.co:5432/postgres"
```

## Your Correct Connection String

Based on your details:
- Project Ref: `laundtxtugquuyscvgzv` (no brackets!)
- Password: `ModexHealthcare@12`
- Encoded Password: `ModexHealthcare%4012`

**Correct format:**
```
postgresql://postgres:ModexHealthcare%4012@db.laundtxtugquuyscvgzv.supabase.co:5432/postgres
```

## Quick Fix Command

Run this:
```bash
cd /Users/harish/Downloads/Modex/Modex
./scripts/migrate-supabase.sh laundtxtugquuyscvgzv ModexHealthcare@12
```

Or if you prefer the full URL:
```bash
cd /Users/harish/Downloads/Modex/Modex
./scripts/migrate-supabase.sh "postgresql://postgres:ModexHealthcare%4012@db.laundtxtugquuyscvgzv.supabase.co:5432/postgres"
```

