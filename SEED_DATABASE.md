# Seed Database with Users

This guide shows you how to add admin, doctor, and patient users to your Supabase database.

## 🚀 Quick Seed

### Option 1: Using Script (Recommended)

```bash
cd Modex
./scripts/seed-supabase.sh laundtxtugquuyscvgzv ModexHealthcare@12
```

Or with full connection string:
```bash
./scripts/seed-supabase.sh "postgresql://postgres:ModexHealthcare%4012@db.laundtxtugquuyscvgzv.supabase.co:5432/postgres"
```

### Option 2: Manual Seeding

```bash
cd Modex/backend
export DATABASE_URL="postgresql://postgres:ModexHealthcare%4012@db.laundtxtugquuyscvgzv.supabase.co:5432/postgres"
npx prisma generate
npx prisma db seed
```

## 👥 Users Created

### Admin User
- **Email**: `admin@neocaresync.com`
- **Password**: `admin123`
- **Role**: ADMIN
- **Name**: Admin User

### Doctor User
- **Email**: `doctor@neocaresync.com`
- **Password**: `doctor123`
- **Role**: DOCTOR
- **Name**: John Doctor
- **Specialization**: Obstetrics & Gynecology
- **Status**: APPROVED
- **License**: MD-12345
- **Availability**: Monday-Friday, 9 AM - 5 PM

### Patient User
- **Email**: `patient@neocaresync.com`
- **Password**: `patient123`
- **Role**: PATIENT
- **Name**: Jane Patient

## 🏥 Additional Data Created

The seed script also creates:
- **7 Departments** for pregnancy care:
  - Obstetrics & Gynecology
  - Maternal-Fetal Medicine
  - Perinatology
  - Reproductive Endocrinology
  - Neonatology
  - Prenatal Care
  - Postpartum Care

## ✅ Verify Users

After seeding, you can verify in Supabase:

1. Go to Supabase Dashboard → **Table Editor**
2. Select **users** table
3. You should see 3 users (admin, doctor, patient)
4. Select **doctors** table to see the doctor profile
5. Select **departments** table to see all departments

## 🔐 Login Credentials Summary

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@neocaresync.com | admin123 |
| Doctor | doctor@neocaresync.com | doctor123 |
| Patient | patient@neocaresync.com | patient123 |

## 🔄 Re-seeding

The seed script uses `upsert`, so running it multiple times is safe:
- If users exist, they won't be duplicated
- If they don't exist, they'll be created
- You can safely re-run the seed script

## 🛠️ Customize Users

To customize the users, edit `backend/prisma/seed.ts`:

```typescript
// Change admin email/password
const admin = await prisma.user.upsert({
  where: { email: 'your-admin@email.com' },
  // ...
});

// Change doctor details
const doctorUser = await prisma.user.upsert({
  where: { email: 'your-doctor@email.com' },
  // ...
});
```

Then re-run the seed script.

## 📝 Next Steps

After seeding:
1. ✅ Test login with admin credentials
2. ✅ Test login with doctor credentials
3. ✅ Test login with patient credentials
4. ✅ Verify doctor is approved and available
5. ✅ Check departments are created

## 🐛 Troubleshooting

### Error: "User already exists"
- This is normal - the script uses `upsert` which updates existing users
- You can safely ignore this

### Error: "Database connection failed"
- Verify DATABASE_URL is correct
- Check password is URL-encoded (special characters)
- Ensure Supabase database is accessible

### Error: "Prisma Client not generated"
- Run: `npx prisma generate` first
- Then run seed script again

