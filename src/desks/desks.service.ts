import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDeskDto } from './dto/create-desk.dto.js';
import { UpdateDeskDto } from './dto/update-desk.dto.js';

@Injectable()
export class DesksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDeskDto) {
    await this.ensureLocation(dto.locationId);
    return this.prisma.desk.create({ data: dto });
  }

  findAll(locationId?: string) {
    return this.prisma.desk.findMany({
      where: { locationId },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const desk = await this.prisma.desk.findUnique({ where: { id } });
    if (!desk) {
      throw new NotFoundException(`Puesto ${id} no encontrado`);
    }
    return desk;
  }

  async update(id: string, dto: UpdateDeskDto) {
    await this.findOne(id);
    if (dto.locationId) {
      await this.ensureLocation(dto.locationId);
    }
    return this.prisma.desk.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.desk.delete({ where: { id } });
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