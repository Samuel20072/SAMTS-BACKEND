import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserResponseDto } from '../dtos/user-response.dto';

@Injectable()
export class FindAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => UserResponseDto.fromEntity(user));
  }
}
