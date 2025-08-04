import * as crypto from 'crypto';
import { Email } from '../value-objects/email';
import { Role as RoleValueObject } from '../value-objects/role';

export class User {
  private constructor(
    private _id: string,
    private _email: Email,
    private _role: RoleValueObject,
    private _passwordHash: string,
  ) {}

  get id(): string {
    return this._id;
  }

  get email(): Email {
    return this._email;
  }

  get role(): RoleValueObject {
    return this._role;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  static create(
    email: Email,
    role: RoleValueObject,
    passwordHash: string,
  ): User {
    return new User(crypto.randomUUID(), email, role, passwordHash);
  }

  static fromPersistence(
    id: string,
    email: Email,
    role: RoleValueObject,
    passwordHash: string,
  ): User {
    return new User(id, email, role, passwordHash);
  }
}
