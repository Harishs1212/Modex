-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PENDING', 'ATTENDED', 'NOT_ATTENDED');

-- DropIndex
DROP INDEX "appointments_doctor_id_appointment_date_start_time_key";

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "attendance_status" "AttendanceStatus",
ADD COLUMN     "booking_status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "is_priority" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slot_id" TEXT;

-- CreateTable
CREATE TABLE "slots" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "slot_date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "max_capacity" INTEGER NOT NULL DEFAULT 6,
    "current_bookings" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "slots_doctor_id_idx" ON "slots"("doctor_id");

-- CreateIndex
CREATE INDEX "slots_slot_date_idx" ON "slots"("slot_date");

-- CreateIndex
CREATE INDEX "slots_is_active_idx" ON "slots"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "slots_doctor_id_slot_date_start_time_key" ON "slots"("doctor_id", "slot_date", "start_time");

-- CreateIndex
CREATE INDEX "appointments_slot_id_idx" ON "appointments"("slot_id");

-- CreateIndex
CREATE INDEX "appointments_booking_status_idx" ON "appointments"("booking_status");

-- CreateIndex
CREATE INDEX "appointments_is_priority_idx" ON "appointments"("is_priority");

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
