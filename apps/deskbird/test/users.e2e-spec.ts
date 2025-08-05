import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { configure } from '../src/configure-app';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import {
  CreateUserDto,
  CreateUserResponseDto,
} from '../src/users/api/user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from '../src/users/application/dto/user.dto';

jest.setTimeout(60000);

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let postgresContainer: StartedPostgreSqlContainer;
  let jwtService: JwtService;

  const authenticatedAdmin = {
    id: '0cf1304f-b291-4981-bd24-2034c886e7ca',
    email: 'admin@example.com',
    role: 'admin',
  };

  const authenticatedUser = {
    id: '1cf1304f-b291-4981-bd24-2034c886e7cb',
    email: 'user@example.com',
    role: 'user',
  };

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer('postgres:17.5-alpine')
      .withDatabase('deskbird')
      .withUsername('user')
      .withPassword('secret')
      .start();

    process.env.TYPEORM_HOST = postgresContainer.getHost();
    process.env.TYPEORM_PORT = postgresContainer.getMappedPort(5432).toString();
    process.env.TYPEORM_USERNAME = postgresContainer.getUsername();
    process.env.TYPEORM_PASSWORD = postgresContainer.getPassword();
    process.env.TYPEORM_DATABASE = postgresContainer.getDatabase();
    process.env.TYPEORM_SYNCHRONIZE = 'true';

    process.env.AUTOLOG_REQ_RES_ENABLED = 'false';
    process.env.REQUESTS_PER_MINUTE = '0';
    process.env.JWT_SECRET_KEY = 'test-secret-key';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configure(app);
    app.useLogger(false);

    dataSource = moduleFixture.get<DataSource>(DataSource);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();
  });

  afterAll(async () => {
    try {
      if (dataSource && dataSource.isInitialized) {
        await dataSource.destroy();
      }
      if (app) {
        await app.close();
      }
    } catch (error) {
      console.error('Error during test cleanup:', error);
    } finally {
      if (postgresContainer) {
        await postgresContainer.stop();
      }
    }
  });

  beforeEach(async () => {
    await seedUserFixture(dataSource, authenticatedAdmin);
    await seedUserFixture(dataSource, authenticatedUser);
  });

  afterEach(async () => {
    await cleanUsersTable(dataSource);
  });

  function generateJwtToken(user: { id: string; email: string }) {
    const payload = { email: user.email, sub: user.id };
    return jwtService.sign(payload);
  }

  it('should create a new user when authenticated as admin', async () => {
    // Create an admin user for authentication
    const jwtToken = generateJwtToken(authenticatedAdmin);

    const newUser = {
      email: 'john.doe@example.com',
      plainPassword: 'password',
      role: 'user',
    };

    const response = await createUserWithAuth(app, newUser, jwtToken);

    expect(response.status).toBe(201);
    expectUser(response.body, {
      id: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      ),
      email: newUser.email,
      role: newUser.role,
    });
  });

  it('should return 401 when creating user without authentication', async () => {
    const user = {
      email: 'john.doe@example.com',
      plainPassword: 'password',
      role: 'user',
    };

    const response = await createUser(app, user);

    expect(response.status).toBe(401);
  });

  it.each([
    {
      user: { email: 'john.doe@example.com', role: 'user' },
      description: 'Missing password',
    },
    {
      user: { role: 'user', plainPassword: 'password' },
      description: 'Missing email',
    },
    {
      user: { email: 'john.doe@example.com', plainPassword: 'password' },
      description: 'Missing role',
    },
    {
      user: { email: 'john.doe@example.com', role: 'user', plainPassword: '' },
      description: 'Empty password',
    },
    {
      user: {
        email: 'john.doe@example.com',
        role: 'user',
        plainPassword: 'short',
      },
      description: 'Short password',
    },
    {
      user: { email: 'john.doe', role: 'user', plainPassword: 'password' },
      description: 'Invalid email',
    },
    {
      user: {
        email: 'john.doe@example.com',
        role: 'superadmin',
        plainPassword: 'password',
      },
      description: 'Invalid role',
    },
  ])('should throw validation error for: $description', async ({ user }) => {
    // Create an admin user for authentication
    const jwtToken = generateJwtToken(authenticatedAdmin);

    const response = await createUserWithAuth(app, user, jwtToken);

    expect(response.status).toBe(400);
  });

  it('should return 403 when regular user tries to create user', async () => {
    const jwtToken = generateJwtToken(authenticatedUser);

    const newUser = {
      email: 'john.doe@example.com',
      plainPassword: 'password',
      role: 'user',
    };

    const response = await createUserWithAuth(app, newUser, jwtToken);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Insufficient permissions');
  });

  it('should delete a user when authenticated as admin', async () => {
    // Arrange: Create a user to delete
    const jwtToken = generateJwtToken(authenticatedAdmin);

    const newUser = {
      email: 'john.doe.delete@example.com',
      plainPassword: 'password',
      role: 'user',
    };

    const createResponse = await createUserWithAuth(app, newUser, jwtToken);
    expect(createResponse.status).toBe(201);

    const createdUserId = createResponse.body.id;

    // Act: Delete the user
    const deleteResponse = await deleteUserWithAuth(app, createdUserId, jwtToken);

    // Assert
    expect(deleteResponse.status).toBe(204);
  });

  it('should return 403 when regular user tries to delete user', async () => {
    const adminJwtToken = generateJwtToken(authenticatedAdmin);
    const userJwtToken = generateJwtToken(authenticatedUser);

    // First create a user as admin
    const newUser = {
      email: 'john.doe@example.com',
      plainPassword: 'password',
      role: 'user',
    };

    const createResponse = await createUserWithAuth(
      app,
      newUser,
      adminJwtToken,
    );
    expect(createResponse.status).toBe(201);

    const createdUserId = createResponse.body.id;

    // Try to delete as regular user - should be forbidden
    const deleteResponse = await deleteUserWithAuth(
      app,
      createdUserId,
      userJwtToken,
    );

    expect(deleteResponse.status).toBe(403);
    expect(deleteResponse.body.message).toBe('Insufficient permissions');
  });
});

async function cleanUsersTable(dataSource: DataSource) {
  const connection = dataSource.manager.connection;
  await connection.query('TRUNCATE users');
}

async function seedUserFixture(dataSource: DataSource, user: UserDto) {
  const connection = dataSource.manager.connection;
  await connection.query(
    'INSERT INTO users (id, email, role, "passwordHash") VALUES ($1, $2, $3, $4)',
    [
      user.id,
      user.email,
      user.role,
      '$argon2i$v=19$m=16,t=2,p=1$NDlvUFJSVHVnTmlqME9ZSA$Flwho1p1wTuQc3W9RdIV9g', // password = password
    ],
  );
}

async function createUser(
  app: INestApplication<App>,
  payload: Partial<CreateUserDto>,
) {
  return request(app.getHttpServer()).post('/api/v1/users').send(payload);
}

async function createUserWithAuth(
  app: INestApplication<App>,
  payload: Partial<CreateUserDto>,
  token: string,
) {
  return request(app.getHttpServer())
    .post('/api/v1/users')
    .set('Authorization', `Bearer ${token}`)
    .send(payload);
}

async function deleteUserWithAuth(
  app: INestApplication<App>,
  userId: string,
  token: string,
) {
  return request(app.getHttpServer())
    .delete(`/api/v1/users/${userId}`)
    .set('Authorization', `Bearer ${token}`);
}

function expectUser(
  got: CreateUserResponseDto,
  want: Partial<CreateUserResponseDto>,
) {
  expect(got).toEqual(want);
}
