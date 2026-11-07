import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { LocationsModule } from './locations/locations.module.js';

@Module({
  imports: [PrismaModule, LocationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
