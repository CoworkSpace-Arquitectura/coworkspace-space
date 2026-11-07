import { Module } from '@nestjs/common';
import { DesksService } from './desks.service.js';
import { DesksController } from './desks.controller.js';

@Module({
  controllers: [DesksController],
  providers: [DesksService],
})
export class DesksModule {}
