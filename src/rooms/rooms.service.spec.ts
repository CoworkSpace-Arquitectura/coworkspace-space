import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { RoomsService } from './rooms.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { Actor } from '../common/actor.js';

const gerente: Actor = { id: 'gerente-1', role: 'MANAGER' };
const otroGerente: Actor = { id: 'gerente-2', role: 'MANAGER' };

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

  it('el gerente de la sede crea una sala', async () => {
    prisma.location.findUnique.mockResolvedValue({ id: 'sede-1', managerId: 'gerente-1' });
    prisma.room.create.mockResolvedValue({ id: 'sala-1', ...dto, equipment: {} });

    const result = await service.create(gerente, { ...dto, kind: 'PRIVATE_OFFICE' });

    expect(prisma.room.create).toHaveBeenCalledWith({
      data: { ...dto, kind: 'PRIVATE_OFFICE', hourlyRate: undefined, equipment: {} },
    });
    expect(result.id).toBe('sala-1');
  });

  it('otro gerente no puede crear salas en una sede ajena', async () => {
    prisma.location.findUnique.mockResolvedValue({ id: 'sede-1', managerId: 'gerente-1' });

    await expect(service.create(otroGerente, dto)).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.room.create).not.toHaveBeenCalled();
  });

  it('no crea la sala si la sede no existe', async () => {
    prisma.location.findUnique.mockResolvedValue(null);

    await expect(service.create(gerente, dto)).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.room.create).not.toHaveBeenCalled();
  });

  it('filtra por capacidad mínima y tipo de espacio', async () => {
    prisma.room.findMany.mockResolvedValue([]);

    await service.findAll(undefined, 6, 'AUDITORIUM');

    expect(prisma.room.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { locationId: undefined, kind: 'AUDITORIUM', capacity: { gte: 6 } },
      }),
    );
  });
});
