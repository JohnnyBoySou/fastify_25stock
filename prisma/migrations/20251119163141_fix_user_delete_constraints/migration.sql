-- DropForeignKey
ALTER TABLE "public"."Schedule" DROP CONSTRAINT "Schedule_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."Schedule" DROP CONSTRAINT "Schedule_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Shift" DROP CONSTRAINT "Shift_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."ShiftParticipant" DROP CONSTRAINT "ShiftParticipant_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."ShiftParticipant" DROP CONSTRAINT "ShiftParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Space" DROP CONSTRAINT "Space_createdById_fkey";

-- AlterTable
ALTER TABLE "Schedule" ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "createdById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Shift" ALTER COLUMN "createdById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ShiftParticipant" ALTER COLUMN "createdById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Space" ALTER COLUMN "createdById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftParticipant" ADD CONSTRAINT "ShiftParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftParticipant" ADD CONSTRAINT "ShiftParticipant_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
