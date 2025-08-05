import { Test, TestingModule } from '@nestjs/testing';
import { GetUsersHandler, GetUsersQuery } from './get-users.query';
import { UserRepository, USER_REPOSITORY } from '../entities/user.repository';
import { UserInMemoryRepository } from '../../infrastructure/user.in-memory.repository';
import { Page, PaginatedResult } from '../../../common/application/page';
import { User } from '../entities/user';
import { Email } from '../value-objects/email';
import { Role } from '../value-objects/role';
import { UserListDto } from '../dto/user-list.dto';
import { Roles } from '../enums/role';

describe('GetUsersHandler', () => {
  let handler: GetUsersHandler;
  let repository: UserInMemoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUsersHandler,
        {
          provide: USER_REPOSITORY,
          useClass: UserInMemoryRepository,
        },
      ],
    }).compile();

    handler = module.get<GetUsersHandler>(GetUsersHandler);
    repository = module.get(USER_REPOSITORY);
  });

  afterEach(() => {
    repository.clear();
  });

  describe('Pagination', () => {
    it('should handle pagination correctly', async () => {
      // Arrange
      await createTestUsers(5);

      // Act
      const result = await executeQuery(1, 2);

      // Assert
      expectPaginatedResult(result, 5, 2);

      result.result.forEach((user) => {
        expectSafeUserDto(user, {
          id: expect.stringMatching(/^user\d+-id$/),
          email: expect.stringMatching(/^user\d+@example\.com$/),
          role: 'user',
        });
      });
    });

    it('should return empty result for page beyond available data', async () => {
      // Arrange
      await createTestUsers(2);

      // Act
      const result = await executeQuery(5, 10);

      // Assert
      expectPaginatedResult(result, 2, 0);
    });

    it('should handle mixed user roles correctly', async () => {
      // Arrange
      await createUser('admin1', 'admin1@example.com', Roles.ADMIN);
      await createUser('user1', 'user1@example.com', Roles.USER);
      await createUser('admin2', 'admin2@example.com', Roles.ADMIN);

      // Act
      const result = await executeQuery();

      // Assert
      expectPaginatedResult(result, 3, 3);

      const roles = result.result.map((user) => user.role);
      expect(roles).toContain('admin');
      expect(roles).toContain('user');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty repository', async () => {
      // Act
      const result = await executeQuery();

      // Assert
      expectPaginatedResult(result, 0, 0);
    });

    it('should handle single user', async () => {
      // Arrange
      await createUser('single-user', 'single@example.com', Roles.USER);

      // Act
      const result = await executeQuery();

      // Assert
      expectPaginatedResult(result, 1, 1);
      expectSafeUserDto(result.result[0], {
        id: 'single-user',
        email: 'single@example.com',
        role: 'user',
      });
    });
  });

  // Helper functions for better test readability
  const createUser = async (
    id: string,
    email: string,
    role: Roles,
    passwordHash = 'hashed-password',
  ) => {
    const user = User.fromPersistence(
      id,
      Email.create(email),
      Role.create(role),
      passwordHash,
    );
    await repository.create(user);
    return user;
  };

  const createTestUsers = async (count: number, role: Roles = Roles.USER) => {
    const users: User[] = [];
    for (let i = 1; i <= count; i++) {
      const user = await createUser(
        `user${i}-id`,
        `user${i}@example.com`,
        role,
        `hashed-password-${i}`,
      );
      users.push(user);
    }
    return users;
  };

  const executeQuery = async (page: number = 1, limit: number = 10) => {
    const query = new GetUsersQuery(new Page(page, limit));
    return handler.execute(query);
  };

  const expectSafeUserDto = (
    userDto: UserListDto,
    expectedData: { id: string; email: string; role: string },
  ) => {
    expect(userDto).toEqual(expectedData);
    expect(userDto).not.toHaveProperty('passwordHash');
    expect(userDto).not.toHaveProperty('_passwordHash');
    expect(userDto).not.toHaveProperty('password');
  };

  const expectPaginatedResult = (
    result: PaginatedResult<UserListDto>,
    expectedTotal: number,
    expectedCount: number,
  ) => {
    expect(result.totalCount).toBe(expectedTotal);
    expect(result.result).toHaveLength(expectedCount);
    expect(Array.isArray(result.result)).toBe(true);
  };
});
