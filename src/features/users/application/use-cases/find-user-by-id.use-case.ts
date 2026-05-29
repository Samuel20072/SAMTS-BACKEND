import { Injectable, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserResponseDto } from '../dtos/user-response.dto';

@Injectable()
export class FindUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return UserResponseDto.fromEntity(user);
  }
}
