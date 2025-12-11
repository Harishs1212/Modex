# Database Seeding Guide

## Quick Seed

To add default users to the database:

```bash
# From backend directory
npm run db:seed
```

Or:

```bash
npm run prisma:seed
```

## Default Users Created

After seeding, you'll have these test accounts:

### Admin
- **Email**: `admin@neocaresync.com`
- **Password**: `admin123`
- **Role**: ADMIN
- **Access**: Full system access

### Doctor
- **Email**: `doctor@neocaresync.com`
- **Password**: `doctor123`
- **Role**: DOCTOR
- **Specialization**: Obstetrics & Gynecology
- **Availability**: Monday-Friday, 9 AM - 5 PM

### Patient
- **Email**: `patient@neocaresync.com`
- **Password**: `patient123`
- **Role**: PATIENT

## Using Docker

If using Docker Compose:

```bash
docker-compose exec backend npm run db:seed
```

## What Gets Created

1. **Admin User**: Full access to all features
2. **Doctor User + Profile**: With availability schedule
3. **Patient User**: Can book appointments and get risk predictions

## Notes

- Seeding is idempotent (safe to run multiple times)
- Uses `upsert` to avoid duplicates
- Passwords are hashed with bcrypt

