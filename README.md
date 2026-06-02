# Obsidian Core

Obsidian Core is the shared backend platform for the Obsidian Systems ecosystem. It provides one account, authorization, application registry, notification, audit, and health foundation for future products such as Obsidian Wallet, Vault, Family, Guardian, Pulse, AI, and additional applications.

## Stack

- NestJS and TypeScript
- PostgreSQL
- Prisma ORM
- JWT access tokens and refresh tokens
- Swagger/OpenAPI at `/api/docs`
- Class Validator DTO validation
- Environment-based configuration
- Docker and Render deployment support

## Modules

- `identity`: registration, login, refresh-token rotation, current user
- `users`: shared user profiles and status
- `roles`: platform roles
- `permissions`: platform permissions
- `applications`: Obsidian ecosystem application registry
- `notifications`: user notifications and preferences
- `audit`: audit event writer for platform activity
- `health`: service and database health endpoint

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Set `DATABASE_URL` to a PostgreSQL database.

4. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Seed base applications, permissions, and roles:

```bash
npm run prisma:seed
```

6. Start the API:

```bash
npm run start:dev
```

The API runs on `http://localhost:3000` by default.

## API Documentation

Swagger is available at:

```text
http://localhost:3000/api/docs
```

## Authentication

Public endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /health`

Authenticated endpoints use the `Authorization: Bearer <accessToken>` header.

Core auth endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/me`

## Authorization

The platform includes role and permission decorators:

- `@Roles('super_admin')`
- `@Permissions('users:read')`

Access tokens identify the shared Obsidian account. Guards hydrate the request user from the database so role and permission changes take effect without changing token payload structure.

## Prisma

The schema lives in `prisma/schema.prisma`.

Useful commands:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:seed
```

## Render Deployment

This repo includes:

- `Dockerfile`
- `render.yaml`
- `.env.example`

### Required Environment Variables

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_ACCESS_SECRET`: long random secret for access tokens.
- `JWT_REFRESH_SECRET`: long random secret for refresh tokens.
- `JWT_ACCESS_EXPIRES_IN`: access-token lifetime, for example `15m`.
- `JWT_REFRESH_EXPIRES_IN`: refresh-token lifetime, for example `7d`.
- `CORS_ORIGINS`: comma-separated list of trusted origins. Leave empty only when no browser clients are deployed yet.
- `PORT`: Render provides this automatically; the app falls back to `3000`.

### Docker Deployment

Render can deploy this project from the included `render.yaml` Blueprint or Dockerfile.

Docker build flow:

```bash
npm ci
npx prisma generate
npm run build
```

Docker start command:

```bash
node dist/main.js
```

The Docker image copies the generated Prisma client, compiled `dist` folder, and `prisma` folder into the runtime stage. The compiled entrypoint is generated at `dist/main.js`.

### Node Deployment

If you deploy as a Render Node service instead of Docker, use:

Build Command:

```bash
npm ci && npm run prisma:generate && npm run build
```

Start Command:

```bash
npm run start:prod
```

### Prisma Migrations

Run migrations before starting production traffic:

```bash
npm run prisma:deploy
```

In `render.yaml`, this is configured as:

```yaml
preDeployCommand: npm run prisma:deploy
```

### Render Deployment Flow

1. Create a new Blueprint from this repository, or create a Web Service using the included Dockerfile.
2. Attach a Render PostgreSQL database.
3. Set environment variables:
   - `DATABASE_URL`
   - `JWT_ACCESS_SECRET`
   - `JWT_REFRESH_SECRET`
   - `JWT_ACCESS_EXPIRES_IN`
   - `JWT_REFRESH_EXPIRES_IN`
   - `CORS_ORIGINS`
4. Deploy. Render runs Prisma migrations as the pre-deploy command, then starts the API with `node dist/main.js`.

## Production Notes

- Use long, random JWT secrets in production.
- Restrict `CORS_ORIGINS` to trusted application origins.
- Run `npm run prisma:deploy` for production migrations.
- Keep refresh-token secrets separate from access-token secrets.
- Add application-specific permissions as future Obsidian products come online.
