import { UserValidationError } from '../errors/user-validation-error';
import { UserError } from '../errors/user.error';

export class Email {
  private constructor(private readonly _value: string) {}

  get value(): string {
    return this._value;
  }

  static create(email: string): Email {
    if (!this.isValid(email)) {
      throw new UserValidationError(UserError.EMAIL_INVALID);
    }
    return new Email(email.toLowerCase().trim());
  }

  private static isValid(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0) {
      return false;
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmedEmail);
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
