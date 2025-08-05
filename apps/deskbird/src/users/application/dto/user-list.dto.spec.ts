import { plainToInstance } from 'class-transformer';
import { UserListDto } from './user-list.dto';
import { Email } from '../value-objects/email';
import { Role } from '../value-objects/role';
import { User } from '../entities/user';

describe('UserListDto', () => {
  it('should transform User domain entity to safe DTO', () => {
    const domainUser = User.fromPersistence(
      'test-id',
      Email.create('test@example.com'),
      Role.create('user'),
      'hashed-password-should-be-excluded'
    );

    const safeDto = plainToInstance(UserListDto, {
      id: domainUser.id,
      email: domainUser.email.value,
      role: domainUser.role.value,
    });

    expect(safeDto.id).toBe('test-id');
    expect(safeDto.email).toBe('test@example.com');
    expect(safeDto.role).toBe('user');
    expect(safeDto).not.toHaveProperty('passwordHash');
    expect(safeDto).not.toHaveProperty('password');
  });

  it('should exclude sensitive data when serialized', () => {
    const dto = plainToInstance(UserListDto, {
      id: 'test-id',
      email: 'test@example.com',
      role: 'admin',
      passwordHash: 'should-be-excluded',
      sensitiveData: 'should-also-be-excluded',
    });

    const serialized = JSON.parse(JSON.stringify(dto));

    expect(serialized).toEqual({
      id: 'test-id',
      email: 'test@example.com',
      role: 'admin',
    });
    expect(serialized).not.toHaveProperty('passwordHash');
    expect(serialized).not.toHaveProperty('sensitiveData');
  });
});