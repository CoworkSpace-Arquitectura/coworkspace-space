import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { assertOwner, assertStaff, type Actor } from '../common/actor.js';
import { ensureCanManageLocation } from '../common/location-access.js';
import { PHOTO_SELECT, withPhotoSrc } from '../photos/photo-src.js';
import { CreateLocationDto } from './dto/create-location.dto.js';
import { UpdateLocationDto } from './dto/update-location.dto.js';

export interface LocationFilters {
  city?: string;
  country?: string;
  managerId?: string;
}

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(actor: Actor, dto: CreateLocationDto) {
    assertStaff(actor);
    const { managerId, ...data } = dto;
    return this.prisma.location.create({
      data: {
        ...data,
        // El jefe puede asignarla a un gerente; un gerente siempre se la queda él.
        managerId: actor.role === 'OWNER' ? (managerId ?? null) : actor.id,
      },
    });
  }

  async findAll(filters: LocationFilters = {}) {
    const locations = await this.prisma.location.findMany({
      where: { city: filters.city, country: filters.country, managerId: filters.managerId },
      orderBy: { name: 'asc' },
      include: { photos: PHOTO_SELECT },
    });
    return locations.map(withPhotoSrc);
  }

  async findOne(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
      include: { rooms: { orderBy: { name: 'asc' } }, desks: { orderBy: { code: 'asc' } }, photos: PHOTO_SELECT },
    });
    if (!location) {
      throw new NotFoundException(`Sede ${id} no encontrada`);
    }
    return withPhotoSrc(location);
  }

  async update(actor: Actor, id: string, dto: UpdateLocationDto) {
    await ensureCanManageLocation(this.prisma, id, actor);
    return this.prisma.location.update({ where: { id }, data: dto });
  }

  async assignManager(actor: Actor, id: string, managerId: string | null) {
    assertOwner(actor);
    await this.findOne(id);
    return this.prisma.location.update({ where: { id }, data: { managerId } });
  }

  async remove(actor: Actor, id: string) {
    assertOwner(actor);
    await this.findOne(id);
    return this.prisma.location.delete({ where: { id } });
  }
}
