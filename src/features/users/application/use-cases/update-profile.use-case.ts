import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

@Injectable()
export class UpdateProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string, dto: UpdateProfileDto, clientId?: string | null): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (clientId && user.clientId !== clientId) {
      throw new ForbiddenException('You do not have access to update this user');
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email;

    const saved = await this.userRepository.save(user);
    return UserResponseDto.fromEntity(saved);
  }
}
