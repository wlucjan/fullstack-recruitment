import { Entity, PrimaryColumn, Column } from 'typeorm';
import { Roles } from '../application/enums/role';
import { User } from '../application/entities/user';
import { Email } from '../application/value-objects/email';
import { Role } from '../application/value-objects/role';

@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  email: string;

  @Column({ enum: Roles })
  role: Roles;

  @Column()
  passwordHash: string;

  static fromDomain(user: User): UserOrmEntity {
    const entity = new UserOrmEntity();
    entity.id = user.id;
    entity.email = user.email.value;
    entity.role = user.role.value;
    entity.passwordHash = user.passwordHash;
    return entity;
  }

  toDomain(): User {
    return User.fromPersistence(
      this.id,
      Email.create(this.email),
      Role.create(this.role),
      this.passwordHash,
    );
  }
}
