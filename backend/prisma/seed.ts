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

  // Create default departments for pregnancy care
  const departments = [
    {
      name: 'Obstetrics & Gynecology',
      description: 'Specialized care for pregnancy, childbirth, and women\'s reproductive health',
    },
    {
      name: 'Maternal-Fetal Medicine',
      description: 'High-risk pregnancy care and fetal monitoring',
    },
    {
      name: 'Perinatology',
      description: 'Care for high-risk pregnancies and complications',
    },
    {
      name: 'Reproductive Endocrinology',
      description: 'Fertility and hormonal issues related to pregnancy',
    },
    {
      name: 'Neonatology',
      description: 'Care for newborns, especially premature or high-risk infants',
    },
    {
      name: 'Prenatal Care',
      description: 'Routine care and monitoring during pregnancy',
    },
    {
      name: 'Postpartum Care',
      description: 'Care after childbirth and recovery support',
    },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
    console.log(`Created/Updated department: ${dept.name}`);
  }

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

  // Get Obstetrics & Gynecology department
  const obgynDept = await prisma.department.findUnique({
    where: { name: 'Obstetrics & Gynecology' },
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
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: admin.id,
      departmentId: obgynDept?.id,
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
