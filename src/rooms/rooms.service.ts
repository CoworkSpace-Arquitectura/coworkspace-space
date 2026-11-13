import { Injectable, NotFoundException } from '@nestjs/common';
import { RoomKind } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Actor } from '../common/actor.js';
import { ensureCanManageLocation } from '../common/location-access.js';
import { CreateRoomDto } from './dto/create-room.dto.js';
import { UpdateRoomDto } from './dto/update-room.dto.js';

const LOCATION_SUMMARY = {
  select: { name: true, city: true, country: true, currency: true, managerId: true },
} as const;

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(actor: Actor, dto: CreateRoomDto) {
    await ensureCanManageLocation(this.prisma, dto.locationId, actor);
    const { locationId, name, kind, capacity, equipment, hourlyRate } = dto;
    return this.prisma.room.create({
      data: { locationId, name, kind, capacity, hourlyRate, equipment: equipment ?? {} },
    });
  }

  findAll(locationId?: string, minCapacity?: number, kind?: RoomKind) {
    return this.prisma.room.findMany({
      where: {
        locationId,
        kind,
        capacity: minCapacity ? { gte: minCapacity } : undefined,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: { location: LOCATION_SUMMARY },
    });
    if (!room) {
      throw new NotFoundException(`Sala ${id} no encontrada`);
    }
    return room;
  }

  async update(actor: Actor, id: string, dto: UpdateRoomDto) {
    const room = await this.findOne(id);
    await ensureCanManageLocation(this.prisma, room.locationId, actor);
    if (dto.locationId && dto.locationId !== room.locationId) {
      // Mover el espacio a otra sede: también debe estar a su cargo.
      await ensureCanManageLocation(this.prisma, dto.locationId, actor);
    }
    const { locationId, name, kind, capacity, equipment, hourlyRate } = dto;
    return this.prisma.room.update({
      where: { id },
      data: { locationId, name, kind, capacity, equipment, hourlyRate },
    });
  }

  async remove(actor: Actor, id: string) {
    const room = await this.findOne(id);
    await ensureCanManageLocation(this.prisma, room.locationId, actor);
    return this.prisma.room.delete({ where: { id } });
  }
}
