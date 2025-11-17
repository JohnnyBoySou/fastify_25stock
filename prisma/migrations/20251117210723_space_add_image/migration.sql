-- CreateTable
CREATE TABLE "space_media" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "space_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "space_media_spaceId_idx" ON "space_media"("spaceId");

-- CreateIndex
CREATE UNIQUE INDEX "space_media_spaceId_mediaId_key" ON "space_media"("spaceId", "mediaId");

-- AddForeignKey
ALTER TABLE "space_media" ADD CONSTRAINT "space_media_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_media" ADD CONSTRAINT "space_media_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
