import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRoomDto } from './dto/create-room.dto.js';
import { UpdateRoomDto } from './dto/update-room.dto.js';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoomDto) {
  await this.ensureLocation(dto.locationId);
  const { locationId, name, capacity, equipment } = dto;
  return this.prisma.room.create({
    data: { locationId, name, capacity, equipment: equipment ?? {} },
  });
}

  findAll(locationId?: string, minCapacity?: number) {
    return this.prisma.room.findMany({
      where: {
        locationId,
        capacity: minCapacity ? { gte: minCapacity } : undefined,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) {
      throw new NotFoundException(`Sala ${id} no encontrada`);
    }
    return room;
  }

  async update(id: string, dto: UpdateRoomDto) {
    await this.findOne(id);
    if (dto.locationId) {
      await this.ensureLocation(dto.locationId);
    }
    return this.prisma.room.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.room.delete({ where: { id } });
  }

  private async ensureLocation(locationId: string) {
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
      select: { id: true },
    });
    if (!location) {
      throw new NotFoundException(`Sede ${locationId} no encontrada`);
    }
  }
}