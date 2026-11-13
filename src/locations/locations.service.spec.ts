import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { LocationsService } from './locations.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { Actor } from '../common/actor.js';

const jefe: Actor = { id: 'jefe-1', role: 'OWNER' };
const gerente: Actor = { id: 'gerente-1', role: 'MANAGER' };
const otroGerente: Actor = { id: 'gerente-2', role: 'MANAGER' };
const socio: Actor = { id: 'socio-1', role: 'MEMBER' };

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
  const dto = { name: 'Sede Centro', city: 'Montería', address: 'Calle 30 #5-20' };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new LocationsService(prisma as unknown as PrismaService);
  });

  it('un gerente crea una sede y queda a su cargo', async () => {
    prisma.location.create.mockResolvedValue({ id: 'sede-1', ...dto });

    await service.create(gerente, { ...dto, managerId: 'otra-persona' });

    expect(prisma.location.create).toHaveBeenCalledWith({
      data: { ...dto, managerId: 'gerente-1' },
    });
  });

  it('el jefe puede crear una sede y asignarla a un gerente', async () => {
    prisma.location.create.mockResolvedValue({ id: 'sede-1' });

    await service.create(jefe, { ...dto, managerId: 'gerente-1' });

    expect(prisma.location.create).toHaveBeenCalledWith({
      data: { ...dto, managerId: 'gerente-1' },
    });
  });

  it('un socio no puede crear sedes (403)', () => {
    expect(() => service.create(socio, dto)).toThrow(ForbiddenException);
    expect(prisma.location.create).not.toHaveBeenCalled();
  });

  it('filtra las sedes por ciudad y agrega la ruta de cada foto', async () => {
    prisma.location.findMany.mockResolvedValue([
      { id: 'sede-1', photos: [{ id: 'f1', url: null, position: 0 }] },
    ]);

    const [sede] = await service.findAll({ city: 'Montería' });

    expect(prisma.location.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { city: 'Montería', country: undefined, managerId: undefined } }),
    );
    expect(sede.photos[0].src).toBe('/locations/sede-1/photos/f1/file');
  });

  it('lanza 404 si la sede no existe', async () => {
    prisma.location.findUnique.mockResolvedValue(null);

    await expect(service.findOne('no-existe')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('un gerente no puede editar la sede de otro gerente', async () => {
    prisma.location.findUnique.mockResolvedValue({ id: 'sede-1', managerId: 'gerente-1' });

    await expect(service.update(otroGerente, 'sede-1', { name: 'X' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.location.update).not.toHaveBeenCalled();
  });

  it('el jefe puede editar cualquier sede', async () => {
    prisma.location.findUnique.mockResolvedValue({ id: 'sede-1', managerId: 'gerente-1' });
    prisma.location.update.mockResolvedValue({ id: 'sede-1' });

    await service.update(jefe, 'sede-1', { name: 'Nueva' });

    expect(prisma.location.update).toHaveBeenCalledWith({ where: { id: 'sede-1' }, data: { name: 'Nueva' } });
  });

  it('solo el jefe elimina sedes: el gerente recibe 403 aunque sea suya', async () => {
    await expect(service.remove(gerente, 'sede-1')).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.location.delete).not.toHaveBeenCalled();
  });

  it('no intenta eliminar una sede que no existe', async () => {
    prisma.location.findUnique.mockResolvedValue(null);

    await expect(service.remove(jefe, 'no-existe')).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.location.delete).not.toHaveBeenCalled();
  });
});
