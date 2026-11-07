import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { RoomsService } from './rooms.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('RoomsService', () => {
  const prisma = {
    location: { findUnique: vi.fn() },
    room: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  let service: RoomsService;

  const dto = { locationId: 'sede-1', name: 'Sala Caribe', capacity: 8 };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RoomsService(prisma as unknown as PrismaService);
  });

  it('crea una sala si la sede existe', async () => {
    prisma.location.findUnique.mockResolvedValue({ id: 'sede-1' });
    prisma.room.create.mockResolvedValue({ id: 'sala-1', ...dto, equipment: {} });

    const result = await service.create(dto);

    expect(prisma.room.create).toHaveBeenCalledWith({ data: { ...dto, equipment: {} } });
    expect(result.id).toBe('sala-1');
  });

  it('no crea la sala si la sede no existe', async () => {
    prisma.location.findUnique.mockResolvedValue(null);

    await expect(service.create(dto)).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.room.create).not.toHaveBeenCalled();
  });

  it('filtra por capacidad mínima', async () => {
    prisma.room.findMany.mockResolvedValue([]);

    await service.findAll(undefined, 6);

    expect(prisma.room.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { locationId: undefined, capacity: { gte: 6 } } }),
    );
  });
});