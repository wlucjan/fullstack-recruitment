import { User } from './user';

export const USER_WRITE_REPOSITORY = Symbol('UserWriteRepository');
export interface UserWriteRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User>;
  delete(id: string): Promise<void>;
}
