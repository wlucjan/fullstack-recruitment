export const PASSWORD_SERVICE = Symbol('PasswordService');

export interface PasswordService {
  hash(plainPassword: string): Promise<string>;
  verify(plainPassword: string, hash: string): Promise<boolean>;
}
