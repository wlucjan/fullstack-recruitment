import { PasswordService } from '../../application/services/password-service';

export class NoopPasswordService implements PasswordService {
  async hash(plainPassword: string): Promise<string> {
    return Promise.resolve(plainPassword);
  }

  async verify(plainPassword: string, hash: string): Promise<boolean> {
    return Promise.resolve(plainPassword === hash);
  }
}
