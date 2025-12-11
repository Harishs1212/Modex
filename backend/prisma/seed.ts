import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@neocaresync.com' },
    update: {},
    create: {
      email: 'admin@neocaresync.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create sample doctor
  const doctorPassword = await bcrypt.hash('doctor123', 10);
  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@neocaresync.com' },
    update: {},
    create: {
      email: 'doctor@neocaresync.com',
      passwordHash: doctorPassword,
      role: 'DOCTOR',
      firstName: 'John',
      lastName: 'Doctor',
      phone: '+1234567890',
    },
  });

  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      specialization: 'Obstetrics & Gynecology',
      licenseNumber: 'MD-12345',
      yearsOfExperience: 10,
      bio: 'Experienced obstetrician specializing in high-risk pregnancies',
      isAvailable: true,
    },
  });

  // Add doctor availability (Monday to Friday, 9 AM to 5 PM)
  for (let day = 1; day <= 5; day++) {
    await prisma.doctorAvailability.upsert({
      where: {
        doctorId_dayOfWeek_startTime: {
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: '09:00',
        },
      },
      update: {},
      create: {
        doctorId: doctor.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
      },
    });
  }

  console.log('Created doctor:', doctorUser.email);

  // Create sample patient
  const patientPassword = await bcrypt.hash('patient123', 10);
  const patient = await prisma.user.upsert({
    where: { email: 'patient@neocaresync.com' },
    update: {},
    create: {
      email: 'patient@neocaresync.com',
      passwordHash: patientPassword,
      role: 'PATIENT',
      firstName: 'Jane',
      lastName: 'Patient',
      phone: '+1234567891',
    },
  });

  console.log('Created patient:', patient.email);
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

