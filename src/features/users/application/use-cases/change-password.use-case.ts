import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { ChangePasswordDto } from '../dtos/change-password.dto';

@Injectable()
export class ChangePasswordUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    id: string,
    dto: ChangePasswordDto,
    clientId?: string | null,
    isSelf: boolean = true,
  ): Promise<void> {
    // In order to check password, we must fetch the password column which is set select: false in TypeORM
    // We can fetch user using datasource or querybuilder to select password.
    // However, to keep it clean, we can inject repository. But the userRepository in clean arch might not support selecting password.
    // Let's implement it inside user repository or use standard repository query.
    // Wait, the repository findById doesn't select password. Let's write the query to select password column.
    // Since TypeOrmUserRepository implements IUserRepository, let's see how we can fetch password.
    // Wait! Let's check how TypeOrmUserRepository is implemented. It uses ormRepository.
    // We can select the password column using ormRepository.
    // Let's update TypeOrmUserRepository if needed, or simply write a check.
    // Wait, let's check TypeOrmUserRepository:
    // It doesn't have an option to select password.
    // Let's add a findByIdWithPassword(id) or modify the userRepository.
    // Actually, we can just use the repository or update IUserRepository to have findById(id, selectPassword?: boolean).
    // Let's update IUserRepository to allow selecting password, or just fetch it in usecase using standard DataSource or similar.
    // Injecting IUserRepository but casting or accessing the underlying ORM repository in usecase breaks DDD boundaries, but doing it in UserRepository is clean.
    // Let's check: can we add `findById(id: string, selectPassword?: boolean)` to `IUserRepository`?
    // Yes! That's very clean and conforms to standard repository pattern.
  }
}
