import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RoomKind } from '@prisma/client';
import { CurrentActor, type Actor } from '../common/actor.js';
import { RoomsService } from './rooms.service.js';
import { CreateRoomDto } from './dto/create-room.dto.js';
import { UpdateRoomDto } from './dto/update-room.dto.js';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@CurrentActor() actor: Actor, @Body() dto: CreateRoomDto) {
    return this.roomsService.create(actor, dto);
  }

  @Get()
  findAll(
    @Query('locationId') locationId?: string,
    @Query('minCapacity', new ParseIntPipe({ optional: true })) minCapacity?: number,
    @Query('kind', new ParseEnumPipe(RoomKind, { optional: true })) kind?: RoomKind,
  ) {
    return this.roomsService.findAll(locationId, minCapacity, kind);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.roomsService.findOne(id);
  }

  @Patch(':id')
  update(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoomDto,
  ) {
    return this.roomsService.update(actor, id, dto);
  }

  @Delete(':id')
  remove(@CurrentActor() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.roomsService.remove(actor, id);
  }
}
