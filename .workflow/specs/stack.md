# Tech Stack

<!-- PINS: backend, database, testing, tooling, docker -->

## Backend
<!-- PIN: backend -->

- **Framework**: NestJS 11
- **HTTP Adapter**: Fastify (via @nestjs/platform-fastify)
- **Language**: TypeScript 5.7
- **Validation**: class-validator + class-transformer
- **API Docs**: Swagger (@nestjs/swagger)
- **Compiler**: SWC (@swc/cli, @swc/core)

## Database
<!-- PIN: database -->

- **Database**: PostgreSQL 17 (Alpine)
- **ORM**: Prisma
- **Schema**: Split schema pattern (base.prisma + models/*.prisma + merge script)
- **IDs**: UUID primary keys
- **Migrations**: Prisma Migrate

## Testing
<!-- PIN: testing -->

- **Unit**: Jest 30 with ts-jest
- **E2E**: Supertest 7
- **Test Module**: @nestjs/testing

## Tooling
<!-- PIN: tooling -->

- **Linting**: ESLint 9 (flat config) + TypeScript ESLint
- **Formatting**: Prettier (singleQuote, trailingComma: all)
- **Package Manager**: npm
- **Build**: NestJS CLI (`nest build`)

## Docker
<!-- PIN: docker -->

- **Compose**: docker-compose.yml for PostgreSQL
- **Image**: postgres:17-alpine
- **Port**: 5432
