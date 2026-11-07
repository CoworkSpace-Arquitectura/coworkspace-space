import { PartialType } from '@nestjs/mapped-types';
import { CreateDeskDto } from './create-desk.dto.js';

export class UpdateDeskDto extends PartialType(CreateDeskDto) {}
