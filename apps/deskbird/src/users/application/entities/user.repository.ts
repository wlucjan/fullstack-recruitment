import { User } from './user';

export const USER_REPOSITORY = Symbol('UserRepository');
export interface UserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User>;
  findByEmail(email: string): Promise<User>;
  delete(id: string): Promise<void>;
}
