import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CurrentActor, type Actor } from '../common/actor.js';
import { DesksService } from './desks.service.js';
import { CreateDeskDto } from './dto/create-desk.dto.js';
import { UpdateDeskDto } from './dto/update-desk.dto.js';

@Controller('desks')
export class DesksController {
  constructor(private readonly desksService: DesksService) {}

  @Post()
  create(@CurrentActor() actor: Actor, @Body() dto: CreateDeskDto) {
    return this.desksService.create(actor, dto);
  }

  @Get()
  findAll(@Query('locationId') locationId?: string) {
    return this.desksService.findAll(locationId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.desksService.findOne(id);
  }

  @Patch(':id')
  update(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeskDto,
  ) {
    return this.desksService.update(actor, id, dto);
  }

  @Delete(':id')
  remove(@CurrentActor() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.desksService.remove(actor, id);
  }
}
