import { Role } from './role';
import { Roles } from '../enums/role';
import { UserError } from '../errors/user.error';

describe('Role', () => {
  describe('create', () => {
    it('should create a valid admin role', () => {
      const role = Role.create('admin');
      expect(role.value).toBe(Roles.ADMIN);
    });

    it('should create a valid user role', () => {
      const role = Role.create('user');
      expect(role.value).toBe(Roles.USER);
    });

    it('should normalize role by trimming whitespace', () => {
      const role = Role.create('  admin  ');
      expect(role.value).toBe(Roles.ADMIN);
    });

    it.each([
      { role: 'invalid-role', description: 'invalid role' },
      { role: '', description: 'empty role' },
      { role: null, description: 'null role' },
      { role: undefined, description: 'undefined role' },
      { role: 'superadmin', description: 'non-existent role' },
      { role: 'Admin', description: 'case sensitive role' },
    ])('should throw error for $description', ({ role }) => {
      expect(() => Role.create(role as any)).toThrow(UserError.ROLE_INVALID);
    });
  });

  describe('equals', () => {
    it('should return true for same role values', () => {
      const role1 = Role.create('admin');
      const role2 = Role.create('admin');
      expect(role1.equals(role2)).toBe(true);
    });

    it('should return false for different role values', () => {
      const role1 = Role.create('admin');
      const role2 = Role.create('user');
      expect(role1.equals(role2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the role value as string', () => {
      const role = Role.create('admin');
      expect(role.toString()).toBe('admin');
    });
  });
});
