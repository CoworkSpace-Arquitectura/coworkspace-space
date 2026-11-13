-- CreateEnum
CREATE TYPE "RoomKind" AS ENUM ('MEETING_ROOM', 'PRIVATE_OFFICE', 'AUDITORIUM', 'PHONE_BOOTH');

-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "manager_id" TEXT;

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "kind" "RoomKind" NOT NULL DEFAULT 'MEETING_ROOM';

-- CreateTable
CREATE TABLE "location_photos" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "url" TEXT,
    "data" BYTEA,
    "mime_type" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "location_photos_location_id_idx" ON "location_photos"("location_id");

-- CreateIndex
CREATE INDEX "locations_manager_id_idx" ON "locations"("manager_id");

-- AddForeignKey
ALTER TABLE "location_photos" ADD CONSTRAINT "location_photos_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
