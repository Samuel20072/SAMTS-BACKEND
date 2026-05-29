import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../../shared/entities/BaseEntity';
import { UserRole } from '../../../../shared/enums/user-role.enum';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;
}
