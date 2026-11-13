import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Actor } from '../common/actor.js';
import { ensureCanManageLocation } from '../common/location-access.js';
import { CreateDeskDto } from './dto/create-desk.dto.js';
import { UpdateDeskDto } from './dto/update-desk.dto.js';

const LOCATION_SUMMARY = {
  select: { name: true, city: true, country: true, currency: true, managerId: true },
} as const;

@Injectable()
export class DesksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(actor: Actor, dto: CreateDeskDto) {
    await ensureCanManageLocation(this.prisma, dto.locationId, actor);
    const { locationId, code, isDedicated, hourlyRate } = dto;
    return this.prisma.desk.create({ data: { locationId, code, isDedicated, hourlyRate } });
  }

  findAll(locationId?: string) {
    return this.prisma.desk.findMany({
      where: { locationId },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const desk = await this.prisma.desk.findUnique({
      where: { id },
      include: { location: LOCATION_SUMMARY },
    });
    if (!desk) {
      throw new NotFoundException(`Puesto ${id} no encontrado`);
    }
    return desk;
  }

  async update(actor: Actor, id: string, dto: UpdateDeskDto) {
    const desk = await this.findOne(id);
    await ensureCanManageLocation(this.prisma, desk.locationId, actor);
    if (dto.locationId && dto.locationId !== desk.locationId) {
      await ensureCanManageLocation(this.prisma, dto.locationId, actor);
    }
    const { locationId, code, isDedicated, hourlyRate } = dto;
    return this.prisma.desk.update({
      where: { id },
      data: { locationId, code, isDedicated, hourlyRate },
    });
  }

  async remove(actor: Actor, id: string) {
    const desk = await this.findOne(id);
    await ensureCanManageLocation(this.prisma, desk.locationId, actor);
    return this.prisma.desk.delete({ where: { id } });
  }
}
