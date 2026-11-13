import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CurrentActor, type Actor } from '../common/actor.js';
import { LocationsService } from './locations.service.js';
import { CreateLocationDto } from './dto/create-location.dto.js';
import { AssignManagerDto, UpdateLocationDto } from './dto/update-location.dto.js';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  create(@CurrentActor() actor: Actor, @Body() dto: CreateLocationDto) {
    return this.locationsService.create(actor, dto);
  }

  @Get()
  findAll(
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('managerId') managerId?: string,
  ) {
    return this.locationsService.findAll({ city, country, managerId });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.locationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationsService.update(actor, id, dto);
  }

  @Patch(':id/manager')
  assignManager(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignManagerDto,
  ) {
    return this.locationsService.assignManager(actor, id, dto.managerId ?? null);
  }

  @Delete(':id')
  remove(@CurrentActor() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.locationsService.remove(actor, id);
  }
}
