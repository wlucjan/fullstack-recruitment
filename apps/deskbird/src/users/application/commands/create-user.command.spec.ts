import { UserInMemoryRepository } from '../../infrastructure/user.in-memory.repository';
import { UserDto } from '../dto/user.dto';
import { User } from '../entities/user';
import { UserAlreadyExistsError } from '../errors/user-already-exists';
import { CreateUserCommand, CreateUserHandler } from './create-user.command';
import { Roles } from '../enums/role';
import { Email } from '../value-objects/email';
import { Role } from '../value-objects/role';
import { NoopPasswordService } from '../../../auth/infrastructure/services/noop.password-service';

describe('CreateUserCommand', () => {
  const userRepository = new UserInMemoryRepository();
  const passwordService = new NoopPasswordService();
  const handler = new CreateUserHandler(userRepository, passwordService);

  it('creates a new user', async () => {
    const command = new CreateUserCommand(
      'john.doe@example.com',
      Roles.USER,
      'password123',
    );

    const createdUser = await handler.execute(command);

    expectUserDtoToMatch(createdUser, command);
    const storedUser = await userRepository.findById(createdUser.id);
    expectUserToMatch(storedUser, command);
  });

  it('should throw if user with email already exists', async () => {
    const existingUser = User.create(
      Email.create('jane.doe@example.com'),
      Role.create(Roles.USER),
      'password123',
    );
    await userRepository.create(existingUser);

    const command = new CreateUserCommand(
      'jane.doe@example.com',
      Roles.USER,
      'password123',
    );

    await expect(handler.execute(command)).rejects.toThrow(
      UserAlreadyExistsError,
    );
  });
});

function expectUserToMatch(got: User, want: CreateUserCommand) {
  expect(got).toBeDefined();

  expect(got.id).toEqual(
    expect.stringMatching(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    ),
  );
  expect(got.email.value).toBe(want.email);
  expect(got.role.value).toBe(want.role);
}

function expectUserDtoToMatch(got: UserDto, want: CreateUserCommand) {
  expect(got).toBeDefined();

  expect(got.id).toEqual(
    expect.stringMatching(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    ),
  );
  expect(got.email).toBe(want.email);
  expect(got.role).toBe(want.role);
}
