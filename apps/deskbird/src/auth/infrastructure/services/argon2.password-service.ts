import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PasswordService } from '../../application/services/password-service';

@Injectable()
export class Argon2PasswordService implements PasswordService {
  async hash(password: string): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3, // Iterations
      parallelism: 1,
    });
  }

  async verify(plainPassword: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plainPassword);
    } catch (err) {
      return false; // In case hash is corrupt or tampered
    }
  }
}
