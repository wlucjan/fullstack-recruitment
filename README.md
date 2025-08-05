# Deskbird Full Stack Application

## Prerequisites

- Docker and Docker Compose (recommended)
- Node.js (v18 or higher) and pnpm (for local development)

## Quick Start with Docker Compose (Recommended)

### Development Mode (with hot reload)

```bash
# Start all services in development mode
docker-compose -f docker-compose.dev.yml up

# Services will be available at:
# - Frontend: http://localhost:4200
# - Backend API: http://localhost:3000
# - Database: localhost:5432
```

### Production Mode

```bash
# Build and start all services
docker-compose -f docker-compose.fullstack.yml up --build

# Services will be available at:
# - Frontend: http://localhost:4200
# - Backend API: http://localhost:3000
```

## Manual Setup (Local Development)

### 1. Environment Configuration

Create a `.env` file in the root directory:

```env
TYPEORM_USERNAME=postgres
TYPEORM_PASSWORD=postgres
TYPEORM_DATABASE=deskbird
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Database

```bash
docker-compose up -d db
```

### 4. Setup Backend

```bash
# Run migrations
pnpm --filter deskbird run migration:run

# Seed database with sample data
pnpm --filter deskbird run seed

# Start backend in development mode
pnpm --filter deskbird run start:dev
```

### 5. Start Frontend

```bash
# Start frontend in development mode
pnpm --filter deskbird-frontend run start
```

The application will be available at:

- **Frontend**: `http://localhost:4200`
- **Backend API**: `http://localhost:3000`
- **API Documentation**: `http://localhost:3000/api` (development only)

## Default Login Credentials

After running the seeding process, you can log in with:

- **Admin User**:
  - Email: `admin@deskbird.com`
  - Password: `admin123`

## Usage

1. **Start the application** using Docker Compose (development mode recommended)
2. **Access the frontend** at http://localhost:4200
3. **Login** with the admin account above
4. **Manage users** - create, view, and delete users through the web interface

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
- If local authN was to be kept it is missing some invitations flow, refresh token, storing token in cookies inaccessible by the frontend's JS
- Add missing CRUD operations for users
- Add comprehensive logging and observability
- Add more integration tests
- Frontend app is fully AI generated
