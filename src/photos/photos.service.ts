import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Actor } from '../common/actor.js';
import { ensureCanManageLocation } from '../common/location-access.js';
import { AddPhotoDto } from './dto/add-photo.dto.js';

export const MAX_PHOTOS = 10;
export const MAX_BYTES = 2 * 1024 * 1024; // 2 MB por imagen ya decodificada

/** "data:image/png;base64,AAAA" -> { mimeType: 'image/png', data: Buffer } */
export function parseDataUrl(dataUrl: string) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/s.exec(dataUrl);
  if (!match) {
    throw new BadRequestException('Formato de imagen no válido');
  }
  const data = Buffer.from(match[2], 'base64');
  if (data.length === 0 || data.length > MAX_BYTES) {
    throw new BadRequestException('La imagen debe pesar menos de 2 MB');
  }
  return { mimeType: match[1], data };
}

@Injectable()
export class PhotosService {
  constructor(private readonly prisma: PrismaService) {}

  async add(actor: Actor, locationId: string, dto: AddPhotoDto) {
    if (!dto.url === !dto.dataUrl) {
      throw new BadRequestException('Envía "url" o "dataUrl", solo una de las dos');
    }
    await ensureCanManageLocation(this.prisma, locationId, actor);

    const count = await this.prisma.locationPhoto.count({ where: { locationId } });
    if (count >= MAX_PHOTOS) {
      throw new BadRequestException(`Una sede admite máximo ${MAX_PHOTOS} fotos`);
    }

    const file = dto.dataUrl ? parseDataUrl(dto.dataUrl) : undefined;
    const photo = await this.prisma.locationPhoto.create({
      data: {
        locationId,
        position: count,
        url: dto.url ?? null,
        data: file?.data,
        mimeType: file?.mimeType,
      },
      select: { id: true, url: true, position: true },
    });
    return { ...photo, src: photo.url ?? `/locations/${locationId}/photos/${photo.id}/file` };
  }

  async file(locationId: string, photoId: string) {
    const photo = await this.prisma.locationPhoto.findFirst({
      where: { id: photoId, locationId },
      select: { data: true, mimeType: true, url: true },
    });
    if (!photo?.data || !photo.mimeType) {
      throw new NotFoundException('Foto no encontrada');
    }
    return { data: Buffer.from(photo.data), mimeType: photo.mimeType };
  }

  async remove(actor: Actor, locationId: string, photoId: string) {
    await ensureCanManageLocation(this.prisma, locationId, actor);
    const { count } = await this.prisma.locationPhoto.deleteMany({
      where: { id: photoId, locationId },
    });
    if (count === 0) {
      throw new NotFoundException('Foto no encontrada');
    }
    return { deleted: photoId };
  }
}
