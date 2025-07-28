import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Role } from '../application/enums/role';

@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column({ enum: Role })
  role: Role;

  @Column()
  passwordHash: string;
}
