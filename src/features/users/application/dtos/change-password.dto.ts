import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!' })
  @IsString()
  @IsNotEmpty()
  oldPassword?: string; // Optional if super admin changes it, but required for self

  @ApiProperty({ example: 'NewPassword123!', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
