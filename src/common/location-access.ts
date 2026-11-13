import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';
import { assertStaff, type Actor } from './actor.js';

/**
 * Regla de propiedad: el jefe puede tocar cualquier sede;
 * un gerente, solo las que tiene a su cargo (managerId).
 */
export async function ensureCanManageLocation(
  prisma: PrismaService,
  locationId: string,
  actor: Actor,
) {
  assertStaff(actor);
  const location = await prisma.location.findUnique({
    where: { id: locationId },
    select: { id: true, managerId: true },
  });
  if (!location) {
    throw new NotFoundException(`Sede ${locationId} no encontrada`);
  }
  if (actor.role !== 'OWNER' && location.managerId !== actor.id) {
    throw new ForbiddenException('Esta sede no está a tu cargo');
  }
  return location;
}
