import { User } from './user';
import { Page, PaginatedResult } from '../../../common/application/page';

export const USER_REPOSITORY = Symbol('UserRepository');
export interface UserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findAll(page: Page): Promise<PaginatedResult<User>>;
  delete(id: string): Promise<void>;
}
