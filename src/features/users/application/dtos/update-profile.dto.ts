import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Carlos Mendoza Updated', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'carlos.updated@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;
}
