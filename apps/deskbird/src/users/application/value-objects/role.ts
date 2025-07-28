import { UserValidationError } from '../errors/user-validation-error';
import { UserError } from '../errors/user.error';
import { isRole, Roles } from '../enums/role';

export class Role {
  private constructor(private readonly _value: Roles) {}

  get value(): Roles {
    return this._value;
  }

  static create(role: string): Role {
    if (!this.isValid(role)) {
      throw new UserValidationError(UserError.ROLE_INVALID);
    }
    return new Role(role.trim() as Roles);
  }

  private static isValid(role: string): boolean {
    if (!role || typeof role !== 'string') {
      return false;
    }

    const trimmedRole = role.trim();
    if (trimmedRole.length === 0) {
      return false;
    }

    return isRole(trimmedRole);
  }

  equals(other: Role): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
