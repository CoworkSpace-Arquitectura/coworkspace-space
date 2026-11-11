-- AlterTable
ALTER TABLE "desks" ADD COLUMN     "hourly_rate" INTEGER NOT NULL DEFAULT 15000;

-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'CO',
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'COP';

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "hourly_rate" INTEGER NOT NULL DEFAULT 30000;

-- CreateIndex
CREATE INDEX "locations_country_idx" ON "locations"("country");
