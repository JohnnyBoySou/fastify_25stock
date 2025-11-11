/*
  Warnings:

  - You are about to drop the column `userId` on the `Subscription` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[storeId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `storeId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- DropIndex
DROP INDEX "public"."Subscription_userId_idx";

-- DropIndex
DROP INDEX "public"."Subscription_userId_key";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "userId",
ADD COLUMN     "storeId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_storeId_key" ON "Subscription"("storeId");

-- CreateIndex
CREATE INDEX "Subscription_storeId_idx" ON "Subscription"("storeId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
