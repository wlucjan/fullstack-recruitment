import { Email } from './email';
import { UserError } from '../errors/user.error';

describe('Email', () => {
  describe('create', () => {
    it('should create a valid email', () => {
      const email = Email.create('test@example.com');
      expect(email.value).toBe('test@example.com');
    });

    it('should normalize email to lowercase and trim', () => {
      const email = Email.create('  TEST@EXAMPLE.COM  ');
      expect(email.value).toBe('test@example.com');
    });

    it.each([
      { email: 'invalid-email', description: 'invalid email format' },
      { email: '', description: 'empty email' },
      { email: null, description: 'null email' },
      { email: undefined, description: 'undefined email' },
      { email: 'test@', description: 'email without domain' },
      { email: 'testexample.com', description: 'email without @ symbol' },
    ])('should throw error for $description', ({ email }) => {
      expect(() => Email.create(email as any)).toThrow(UserError.EMAIL_INVALID);
    });
  });

  describe('equals', () => {
    it('should return true for same email values', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different email values', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });

    it.each([
      { email1: 'TEST@EXAMPLE.COM', email2: 'test@example.com' },
      { email1: 'Test@Example.com', email2: 'test@example.com' },
      { email1: 'test@EXAMPLE.COM', email2: 'test@example.com' },
    ])(
      'should be case insensitive for $email1 and $email2',
      ({ email1, email2 }) => {
        const emailObj1 = Email.create(email1);
        const emailObj2 = Email.create(email2);
        expect(emailObj1.equals(emailObj2)).toBe(true);
      },
    );
  });

  describe('toString', () => {
    it('should return the email value as string', () => {
      const email = Email.create('test@example.com');
      expect(email.toString()).toBe('test@example.com');
    });
  });
});
