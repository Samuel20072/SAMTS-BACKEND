import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: CreateUserDto, clientId?: string | null): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException(`User with email ${dto.email} already exists`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = new User();
    user.email = dto.email;
    user.password = hashedPassword;
    user.name = dto.name;
    if (dto.role) {
      user.role = dto.role;
    }
    if (clientId) {
      user.clientId = clientId;
    }

    const savedUser = await this.userRepository.save(user);
    return UserResponseDto.fromEntity(savedUser);
  }
}
