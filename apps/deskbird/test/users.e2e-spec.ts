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

jest.setTimeout(30000);

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let postgresContainer: StartedPostgreSqlContainer;

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

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configure(app);
    app.useLogger(false);

    await app.init();
  });

  afterAll(async () => {
    await app.close();

    if (postgresContainer) {
      await postgresContainer.stop();
    }
  });

  beforeEach(async () => {
    const connection = app.get<DataSource>(DataSource).manager.connection;
    await connection.query('TRUNCATE users');
  });

  it('should creeate a new user', async () => {
    const user = {
      email: 'john.doe@example.com',
      plainPassword: 'password',
      role: 'user',
    };

    const response = await createUser(app, user);

    console.log(response.body);

    expect(response.status).toBe(201);
    expectUser(response.body, {
      id: expect.stringMatching(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      ),
      email: user.email,
      role: user.role,
    });
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
    const response = await createUser(app, user);

    expect(response.status).toBe(400);
  });
});

async function createUser(
  app: INestApplication<App>,
  payload: Partial<CreateUserDto>,
) {
  return request(app.getHttpServer()).post('/api/v1/users').send(payload);
}

function expectUser(
  got: CreateUserResponseDto,
  want: Partial<CreateUserResponseDto>,
) {
  expect(got).toEqual(want);
}
