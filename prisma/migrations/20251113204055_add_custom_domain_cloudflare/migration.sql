/*
  Warnings:

  - You are about to drop the column `domainStatus` on the `Store` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Store" DROP COLUMN "domainStatus",
ADD COLUMN     "cloudflareHostnameId" TEXT,
ADD COLUMN     "cloudflareStatus" TEXT DEFAULT 'pending_validation';
