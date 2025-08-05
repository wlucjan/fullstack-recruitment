# Deskbird API

A NestJS-based user management API with authentication and authorization.

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- Docker and Docker Compose (for database)

## Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Environment configuration:**

   ```bash
   cd apps/deskbird
   cp .env.example .env
   ```

   Update the `.env` file with your configuration if needed.

3. **Start the database:**

   ```bash
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   pnpm --filter deskbird run migration:run
   ```

## Starting Application

### Development Mode

```bash
pnpm --filter deskbird run start:dev
```

### Production Mode

```bash
pnpm --filter deskbird run build
pnpm --filter deskbird run start:prod
```

### Debug Mode

```bash
pnpm --filter deskbird run start:debug
```

The API will be available at `http://localhost:3000/api/v1`

### API Documentation

Swagger documentation is available at `http://localhost:3000/api` (development only)

## Running Tests

### Unit Tests

````bash
# Run all unit tests
pnpm --filter deskbird run test

# Run tests in watch mode
pnpm --filter deskbird run test:watch

### E2E Tests
```bash
pnpm --filter deskbird run test:e2e
````

**Note:** E2E tests use Docker containers for PostgreSQL, so Docker must be running.

## API Testing

Use the `api.http` file in the root directory with REST clients like:

- VS Code REST Client extension
- IntelliJ HTTP Client

## Project Structure

```
apps/deskbird/
├── src/
│   ├── auth/           # Authentication & authorization
│   ├── users/          # User management
│   ├── common/         # Shared utilities
│   ├── database/       # Database configuration
│   ├── health/         # Health check endpoints
│   └── migrations/     # Database migrations
└── test/               # E2E tests
```

## What I would add or do differently

- Use authN service like Supertokens, FusionAuth or Keycloak
- Add comprehensive logging and monitoring
