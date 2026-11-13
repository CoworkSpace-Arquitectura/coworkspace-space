import { RoomKind } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateRoomDto {
  @IsUUID()
  locationId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  /** Sala de reuniones, oficina privada, auditorio o cabina telefónica. */
  @IsOptional()
  @IsEnum(RoomKind)
  kind?: RoomKind;

  @IsInt()
  @Min(1)
  capacity!: number;

  @IsOptional()
  @IsObject()
  equipment?: Record<string, string | number | boolean>;

  @IsOptional()
  @IsInt()
  @Min(0)
  hourlyRate?: number;
}
