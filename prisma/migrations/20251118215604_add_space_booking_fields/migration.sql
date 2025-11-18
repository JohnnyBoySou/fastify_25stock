-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "allowOverlapping" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gapTime" INTEGER,
ADD COLUMN     "maxSimultaneousBookings" INTEGER,
ADD COLUMN     "minBookingDuration" INTEGER,
ADD COLUMN     "requiresApproval" BOOLEAN NOT NULL DEFAULT false;
