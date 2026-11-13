/** Zona horaria principal de cada país, para cuando la sede no indica una. */
const COUNTRY_TIME_ZONE: Record<string, string> = {
  AR: 'America/Argentina/Buenos_Aires',
  BR: 'America/Sao_Paulo',
  CA: 'America/Toronto',
  CL: 'America/Santiago',
  CO: 'America/Bogota',
  CR: 'America/Costa_Rica',
  DE: 'Europe/Berlin',
  EC: 'America/Guayaquil',
  ES: 'Europe/Madrid',
  FR: 'Europe/Paris',
  GB: 'Europe/London',
  IT: 'Europe/Rome',
  JP: 'Asia/Tokyo',
  MX: 'America/Mexico_City',
  PA: 'America/Panama',
  PE: 'America/Lima',
  PT: 'Europe/Lisbon',
  US: 'America/New_York',
  UY: 'America/Montevideo',
  VE: 'America/Caracas',
};

export function defaultTimeZone(country = 'CO') {
  return COUNTRY_TIME_ZONE[country.toUpperCase()] ?? 'America/Bogota';
}
