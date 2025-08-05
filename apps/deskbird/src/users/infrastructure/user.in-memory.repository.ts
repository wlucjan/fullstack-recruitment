import { Injectable } from '@nestjs/common';
import { UserRepository } from '../application/entities/user.repository';
import { User as DomainUser } from '../application/entities/user';
import { UserNotFoundError } from '../application/errors/user-not-found';
import { UserAlreadyExistsError } from '../application/errors/user-already-exists';
import { Page, PaginatedResult } from '../../common/application/page';

@Injectable()
export class UserInMemoryRepository implements UserRepository {
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

  async findByEmail(email: string): Promise<DomainUser> {
    const user = Array.from(this.users.values()).find(
      (u) => u.email.value === email,
    );

    if (!user) {
      throw new UserNotFoundError();
    }

    return Promise.resolve(user);
  }

  async findAll(page: Page): Promise<PaginatedResult<DomainUser>> {
    const allUsers = Array.from(this.users.values());
    const totalCount = allUsers.length;

    const startIndex = page.offset;
    const endIndex = startIndex + page.limit;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    return Promise.resolve(new PaginatedResult(paginatedUsers, totalCount));
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
