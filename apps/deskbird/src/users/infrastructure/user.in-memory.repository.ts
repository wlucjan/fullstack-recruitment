import { Injectable } from '@nestjs/common';
import { UserWriteRepository } from '../application/entities/user.repository';
import { User as DomainUser } from '../application/entities/user';
import { UserNotFoundError } from '../application/errors/user-not-found';
import { UserAlreadyExistsError } from '../application/errors/user-already-exists';

@Injectable()
export class UserInMemoryRepository implements UserWriteRepository {
  private users = new Map<string, DomainUser>();

  async create(user: DomainUser): Promise<DomainUser> {
    const existingUser = Array.from(this.users.values()).find(
      (u) => u.email.value === user.email.value,
    );

    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    this.users.set(user.id, user);

    return Promise.resolve(user);
  }

  async findById(id: string): Promise<DomainUser> {
    const user = this.users.get(id);

    if (!user) {
      throw new UserNotFoundError();
    }

    return Promise.resolve(user);
  }

  async delete(id: string): Promise<void> {
    const user = this.users.get(id);

    if (!user) {
      throw new UserNotFoundError();
    }

    this.users.delete(id);
    return Promise.resolve();
  }

  // Helper method for testing - clear all users
  clear(): void {
    this.users.clear();
  }

  // Helper method for testing - get all users
  getAll(): DomainUser[] {
    return Array.from(this.users.values());
  }
}
