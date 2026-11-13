import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsUUID } from 'class-validator';
import { CreateLocationDto } from './create-location.dto.js';

/** El gerente no se cambia aquí: para eso está PATCH /locations/:id/manager (solo el jefe). */
export class UpdateLocationDto extends PartialType(OmitType(CreateLocationDto, ['managerId'] as const)) {}

export class AssignManagerDto {
  /** null = la sede queda sin gerente (solo la administra el jefe). */
  @IsOptional()
  @IsUUID()
  managerId!: string | null;
}
