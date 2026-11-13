import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { parseDataUrl, PhotosService } from './photos.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { Actor } from '../common/actor.js';

const jefe: Actor = { id: 'jefe-1', role: 'OWNER' };

describe('PhotosService', () => {
  const prisma = {
    location: { findUnique: vi.fn() },
    locationPhoto: { count: vi.fn(), create: vi.fn() },
  };
  let service: PhotosService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PhotosService(prisma as unknown as PrismaService);
    prisma.location.findUnique.mockResolvedValue({ id: 'sede-1', managerId: null });
  });

  it('convierte un dataUrl en bytes y tipo de imagen', () => {
    const { mimeType, data } = parseDataUrl('data:image/png;base64,aG9sYQ==');
    expect(mimeType).toBe('image/png');
    expect(data.toString()).toBe('hola');
  });

  it('rechaza si llegan url y dataUrl a la vez', async () => {
    await expect(
      service.add(jefe, 'sede-1', { url: 'https://x.com/a.jpg', dataUrl: 'data:image/png;base64,aA==' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('no deja pasar de 10 fotos por sede', async () => {
    prisma.locationPhoto.count.mockResolvedValue(10);

    await expect(service.add(jefe, 'sede-1', { url: 'https://x.com/a.jpg' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prisma.locationPhoto.create).not.toHaveBeenCalled();
  });

  it('guarda un enlace externo en la posición siguiente', async () => {
    prisma.locationPhoto.count.mockResolvedValue(2);
    prisma.locationPhoto.create.mockResolvedValue({ id: 'f3', url: 'https://x.com/a.jpg', position: 2 });

    const photo = await service.add(jefe, 'sede-1', { url: 'https://x.com/a.jpg' });

    expect(photo.src).toBe('https://x.com/a.jpg');
    expect(prisma.locationPhoto.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ position: 2 }) }),
    );
  });
});
