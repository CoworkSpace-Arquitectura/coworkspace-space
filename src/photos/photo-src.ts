/** Campos de foto que se devuelven en los listados: nunca los bytes (data). */
export const PHOTO_SELECT = {
  select: { id: true, url: true, position: true },
  orderBy: { position: 'asc' },
} as const;

interface PhotoRow {
  id: string;
  url: string | null;
  position: number;
}

/**
 * Agrega "src" a cada foto: el enlace externo si lo hay o, si se subió un archivo,
 * la ruta relativa que lo sirve. El sitio web le antepone la URL del Gateway.
 */
export function withPhotoSrc<T extends { id: string; photos: PhotoRow[] }>(location: T) {
  return {
    ...location,
    photos: location.photos.map((photo) => ({
      ...photo,
      src: photo.url ?? `/locations/${location.id}/photos/${photo.id}/file`,
    })),
  };
}
