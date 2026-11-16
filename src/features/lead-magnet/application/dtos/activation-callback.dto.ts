import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Callback S2S enviado por SAMTS Catalog cuando un lead activa su invitación.
 * La activación se sincroniza por pull (S2S); este callback es un refuerzo
 * idempotente y nunca es disparado desde el navegador.
 */
export class ActivationCallbackDto {
  @ApiProperty({ description: 'ID del lead en SAMTS (externalLeadId)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  externalLeadId: string;

  @ApiProperty({ example: '2026-11-14T15:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  activatedAt: string;

  @ApiProperty({ required: false, example: 'lanzamiento_20_dias' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  campaign?: string;
}
