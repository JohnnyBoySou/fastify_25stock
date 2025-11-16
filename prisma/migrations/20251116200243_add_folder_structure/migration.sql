/*
  Warnings:

  - You are about to drop the `document_folders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."document_folders" DROP CONSTRAINT "document_folders_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."document_folders" DROP CONSTRAINT "document_folders_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."document_folders" DROP CONSTRAINT "document_folders_storeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_folderId_fkey";

-- DropTable
DROP TABLE "public"."document_folders";

-- CreateTable
CREATE TABLE "folders" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "createdById" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folder_media" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "folder_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "folders_storeId_idx" ON "folders"("storeId");

-- CreateIndex
CREATE INDEX "folders_parentId_idx" ON "folders"("parentId");

-- CreateIndex
CREATE INDEX "folders_deletedAt_idx" ON "folders"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "folders_storeId_name_parentId_key" ON "folders"("storeId", "name", "parentId");

-- CreateIndex
CREATE INDEX "folder_media_folderId_idx" ON "folder_media"("folderId");

-- CreateIndex
CREATE UNIQUE INDEX "folder_media_folderId_mediaId_key" ON "folder_media"("folderId", "mediaId");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder_media" ADD CONSTRAINT "folder_media_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folder_media" ADD CONSTRAINT "folder_media_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
