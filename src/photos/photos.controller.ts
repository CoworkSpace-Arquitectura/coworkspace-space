import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentActor, type Actor } from '../common/actor.js';
import { PhotosService } from './photos.service.js';
import { AddPhotoDto } from './dto/add-photo.dto.js';

@Controller('locations/:locationId/photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Post()
  add(
    @CurrentActor() actor: Actor,
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Body() dto: AddPhotoDto,
  ) {
    return this.photosService.add(actor, locationId, dto);
  }

  /** Sirve la imagen subida como archivo, para usarla en <img src="...">. */
  @Get(':photoId/file')
  async file(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
    @Res() res: Response,
  ) {
    const { data, mimeType } = await this.photosService.file(locationId, photoId);
    res.set({ 'Content-Type': mimeType, 'Cache-Control': 'public, max-age=86400' });
    res.send(data);
  }

  @Delete(':photoId')
  remove(
    @CurrentActor() actor: Actor,
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
  ) {
    return this.photosService.remove(actor, locationId, photoId);
  }
}
