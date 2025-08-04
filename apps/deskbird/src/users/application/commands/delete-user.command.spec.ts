import { UserInMemoryRepository } from '../../infrastructure/user.in-memory.repository';
import { User } from '../entities/user';
import { Roles } from '../enums/role';
import { DeleteUserCommand, DeleteUserHandler } from './delete-user.command';
import { UserNotFoundError } from '../errors/user-not-found';
import { Email } from '../value-objects/email';
import { Role } from '../value-objects/role';

describe('DeleteUserCommand', () => {
  const userRepository = new UserInMemoryRepository();
  const handler = new DeleteUserHandler(userRepository);

  it('should delete user', async () => {
    const existingUser = User.create(
      Email.create('john.doe@example.com'),
      Role.create(Roles.USER),
      'password123',
    );
    await userRepository.create(existingUser);

    const command = new DeleteUserCommand(existingUser.id);
    await handler.execute(command);

    await expect(userRepository.findById(existingUser.id)).rejects.toThrow(
      UserNotFoundError,
    );
  });

  it('should throw if user with id does not exist', async () => {
    const command = new DeleteUserCommand('non-existent-id');

    await expect(handler.execute(command)).rejects.toThrow(UserNotFoundError);
  });
});
