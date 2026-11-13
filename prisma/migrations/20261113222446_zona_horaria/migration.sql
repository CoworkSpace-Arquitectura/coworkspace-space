-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "time_zone" TEXT NOT NULL DEFAULT 'America/Bogota';

-- Asigna la zona horaria correcta a las sedes que ya existían, según su país
UPDATE "locations" SET "time_zone" = CASE "country"
  WHEN 'ES' THEN 'Europe/Madrid'
  WHEN 'MX' THEN 'America/Mexico_City'
  WHEN 'US' THEN 'America/New_York'
  WHEN 'AR' THEN 'America/Argentina/Buenos_Aires'
  WHEN 'CL' THEN 'America/Santiago'
  WHEN 'PE' THEN 'America/Lima'
  ELSE 'America/Bogota'
END;