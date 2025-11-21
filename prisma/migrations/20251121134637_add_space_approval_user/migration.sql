-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "approvalUserId" TEXT;

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_approvalUserId_fkey" FOREIGN KEY ("approvalUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
