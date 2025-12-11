# Troubleshooting Guide

## Cannot Sign In

### Issue: "Invalid refresh token" error on server

**Cause**: Stale or invalid refresh token in browser localStorage trying to auto-refresh.

**Solution**:
1. Clear browser localStorage:
   - Open browser DevTools (F12)
   - Go to Application/Storage tab
   - Clear Local Storage
   - Or run in console: `localStorage.clear()`

2. Try logging in again with:
   - **Admin**: `admin@neocaresync.com` / `admin123`
   - **Doctor**: `doctor@neocaresync.com` / `doctor123`
   - **Patient**: `patient@neocaresync.com` / `patient123`

### Issue: Login fails with "Invalid email or password"

**Solutions**:
1. Make sure database is seeded:
   ```bash
   cd backend
   npm run db:seed
   ```

2. Verify database connection:
   - Check `backend/.env` has correct `DATABASE_URL`
   - For local: `postgresql://postgres:postgres@localhost:5432/neocaresync?schema=public`
   - For Supabase: Use connection string from Supabase dashboard

3. Check backend logs for errors

### Issue: Server crashes on refresh token request

**Fixed**: Added async error handlers to properly catch and handle errors.

**If still happening**:
1. Restart backend server
2. Clear browser localStorage
3. Try again

## ML Service Not Starting

### Issue: "ModuleNotFoundError: No module named 'app'"

**Solution**: Run from `ml-service` directory, not from `ml-service/app`:
```bash
cd ml-service
uvicorn app.main:app --reload --port 8000
```

## Database Connection Issues

### Issue: "P1013: The provided database string is invalid"

**Solution**: 
1. Check `backend/.env` file
2. For local PostgreSQL:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/neocaresync?schema=public"
   ```
3. For Supabase: Use connection string from Supabase dashboard (Settings > Database)

### Issue: "No migration found"

**Solution**: Create initial migration:
```bash
cd backend
npx prisma migrate dev --name init
```

## Frontend Not Connecting to Backend

### Issue: CORS errors or connection refused

**Solutions**:
1. Check `frontend/.env` has:
   ```
   VITE_API_URL=http://localhost:3000
   ```

2. Verify backend is running on port 3000

3. Check backend CORS config in `backend/src/config/env.ts`

## Quick Reset

If everything is broken, do a full reset:

```bash
# 1. Stop all services
docker-compose down  # if using Docker
# Or stop individual services

# 2. Clear browser localStorage
# Open DevTools > Application > Clear Local Storage

# 3. Reset database (if needed)
cd backend
npx prisma migrate reset  # WARNING: Deletes all data
npm run db:seed

# 4. Restart services
npm run dev  # in backend
npm run dev  # in frontend
```

## Still Having Issues?

1. Check all service logs for errors
2. Verify all environment variables are set
3. Ensure all services are running:
   - Backend: http://localhost:3000
   - Frontend: http://localhost:5173
   - ML Service: http://localhost:8000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

