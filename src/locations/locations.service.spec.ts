import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { LocationsService } from './locations.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('LocationsService', () => {
  const prisma = {
    location: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  let service: LocationsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LocationsService(prisma as unknown as PrismaService);
  });

  it('crea una sede con los datos recibidos', async () => {
    const dto = { name: 'Sede Centro', city: 'Montería', address: 'Calle 30 #5-20' };
    prisma.location.create.mockResolvedValue({ id: 'sede-1', ...dto });

    const result = await service.create(dto);

    expect(prisma.location.create).toHaveBeenCalledWith({ data: dto });
    expect(result.id).toBe('sede-1');
  });

  it('filtra las sedes por ciudad', async () => {
    prisma.location.findMany.mockResolvedValue([]);

    await service.findAll('Montería');

    expect(prisma.location.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { city: 'Montería' } }),
    );
  });

  it('lanza 404 si la sede no existe', async () => {
    prisma.location.findUnique.mockResolvedValue(null);

    await expect(service.findOne('no-existe')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('no intenta eliminar una sede que no existe', async () => {
    prisma.location.findUnique.mockResolvedValue(null);

    await expect(service.remove('no-existe')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.location.delete).not.toHaveBeenCalled();
  });
});