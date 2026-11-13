import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { LocationsModule } from './locations/locations.module.js';
import { RoomsModule } from './rooms/rooms.module.js';
import { DesksModule } from './desks/desks.module.js';
import { PhotosModule } from './photos/photos.module.js';

@Module({
  imports: [PrismaModule, LocationsModule, RoomsModule, DesksModule, PhotosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
