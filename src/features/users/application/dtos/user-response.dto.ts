import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../../shared/enums/user-role.enum';
import { User } from '../../domain/entities/user.entity';

export class UserResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the user',
    example: 'd3b07384-d113-4956-a5db-8216b7d90d79',
  })
  id: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'Carlos Mendoza',
  })
  name: string;

  @ApiProperty({
    description: 'The role assigned to the user',
    enum: UserRole,
    example: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Indicates whether the user account is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'The date and time the user account was created',
    example: '2026-05-29T01:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date and time the user account was last updated',
    example: '2026-05-29T01:00:00.000Z',
  })
  updatedAt: Date;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.name = user.name;
    dto.role = user.role;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
