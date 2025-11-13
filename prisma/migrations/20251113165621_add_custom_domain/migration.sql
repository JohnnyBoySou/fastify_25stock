-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "customDomain" TEXT,
ADD COLUMN     "domainStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "subdomain" TEXT;
