import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { AppModule } from '../src/app.module';
import { configure } from '../src/configure-app';
import { App } from 'supertest/types';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { seedUserFixture, cleanUsersTable } from './fixtures';
import { DataSource } from 'typeorm';

jest.setTimeout(60000);

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let postgresContainer: StartedPostgreSqlContainer;
  let dataSource: DataSource;
  let jwtService: JwtService;

  const authenticatedUser = {
    id: '0cf1304f-b291-4981-bd24-2034c886e7ca',
    email: 'admin@example.com',
    role: 'admin',
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
    await seedUserFixture(dataSource, authenticatedUser);
  });

  afterEach(async () => {
    await cleanUsersTable(dataSource);
  });

  describe('POST /auth/login', () => {
    it('should login successfully and return JWT token in response body', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: authenticatedUser.email,
          password: 'password',
        })
        .expect(201);

      expect(response.body).toEqual({
        access_token: expect.any(String),
        token_type: 'Bearer',
        expires_in: 86400,
      });

      expect(response.body.access_token).toBeTruthy();

      const decodedToken = jwtService.decode(response.body.access_token);
      expect(decodedToken).toBeTruthy();
      expect(decodedToken.sub).toBe(authenticatedUser.id);
      expect(decodedToken.iat).toBeDefined();
      expect(decodedToken.exp).toBeDefined();
    });

    it('should fail login with invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: authenticatedUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});
