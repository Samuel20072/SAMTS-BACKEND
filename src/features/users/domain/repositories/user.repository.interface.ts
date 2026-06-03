import { User } from '../entities/user.entity';

export abstract class IUserRepository {
  abstract save(user: User): Promise<User>;
  abstract findById(id: string, selectPassword?: boolean): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findAll(clientId?: string | null): Promise<User[]>;
  abstract delete(id: string): Promise<void>;
}
