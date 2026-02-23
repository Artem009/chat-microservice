# Request Log

This file tracks all changes made to the project.

---

### R-009 | 2026-02-23
**Type**: feature
**Tags**: #infrastructure #decorators
**Request**: "Create LocalApiProperty decorator (wf-fa3de969)"
**Result**: Created src/common/constants/mode.ts with ENV_MODE constant (LOCAL, INTEGRATED). Created src/common/decorators/local-api-property.decorator.ts using applyDecorators to compose IsString() with conditional ApiProperty() — only shows in Swagger when MODE=LOCAL. Matches reference project pattern exactly. 6 unit tests pass. Core API Infrastructure feature (ft-37e277e7) now 100% complete (5/5 stories).
**Files**: src/common/constants/mode.ts, src/common/decorators/local-api-property.decorator.ts, src/common/decorators/local-api-property.spec.ts

---

### R-008 | 2026-02-23
**Type**: feature
**Tags**: #infrastructure #prisma #database
**Request**: "Set up Prisma with PostgreSQL and split schema pattern (wf-607119a1)"
**Result**: Installed prisma@6.19.2 and @prisma/client@6.19.2. Created split schema structure: prisma/base.prisma (generator + datasource), prisma/models/ directory, prisma/merge.ts script. Created PrismaService (extends PrismaClient, OnModuleInit/OnModuleDestroy) and PrismaModule (global provider). Added 6 NPM scripts (prisma:merge, prisma:generate, prisma:migrate:*). Integrated PrismaModule into AppModule. Note: Prisma 7 has breaking change for datasource URL config — used 6.x to match reference. Database Layer feature (ft-cab4f180) now 100% complete.
**Files**: prisma/base.prisma, prisma/merge.ts, prisma/models/.gitkeep, src/prisma/prisma.service.ts, src/prisma/prisma.module.ts, src/prisma/prisma.spec.ts, src/app.module.ts, package.json, .env, .env.example, .gitignore

---

### R-007 | 2026-02-23
**Type**: feature
**Tags**: #infrastructure #docker
**Request**: "Add docker-compose for PostgreSQL (wf-fce9b3c6)"
**Result**: Created docker-compose.yml with postgres:17-alpine image, container name chat-microservice-2, database chatsDB on port 5432. Matches reference project pattern. Unblocked wf-607119a1 (Prisma setup).
**Files**: docker-compose.yml

---

### R-006 | 2026-02-23
**Type**: feature
**Tags**: #infrastructure #error-handling
**Request**: "Create custom exception classes (wf-d4b6a59f)"
**Result**: Created BadRequestException and NotFoundException extending HttpException with structured response format (message, error snake_case identifier, createdAt, optional additional fields). Added Error interface using `never` types to prevent overriding reserved fields. Barrel export via index.ts. 6 unit tests pass.
**Files**: src/exeption/error-interface.ts, src/exeption/bad-request.exception.ts, src/exeption/not-found.exception.ts, src/exeption/index.ts, src/exeption/exeption.spec.ts

---

### R-005 | 2026-02-23
**Type**: feature
**Tags**: #infrastructure #validation
**Request**: "Add global ValidationPipe with class-validator (wf-4d288338)"
**Result**: Installed class-validator@0.14.3 and class-transformer@0.5.1. Configured global ValidationPipe in main.ts with whitelist, forbidNonWhitelisted, and transform options. All tests pass.
**Files**: src/main.ts, package.json, package-lock.json

---

### R-004 | 2026-02-23
**Type**: feature
**Tags**: #infrastructure #swagger
**Request**: "Add Swagger documentation setup (wf-f548c77a)"
**Result**: Installed @nestjs/swagger@11.2.6. Configured DocumentBuilder in main.ts with title "Chat microservice", API key security (authorization header), and SwaggerModule at /api-docs with persistAuthorization. All tests pass.
**Files**: src/main.ts, package.json, package-lock.json

---

### R-003 | 2026-02-23
**Type**: refactor
**Tags**: #infrastructure #fastify
**Request**: "Switch HTTP adapter from Express to Fastify (wf-cfbf29f1)"
**Result**: Replaced Express adapter with FastifyAdapter in main.ts. Installed @nestjs/platform-fastify, fastify, @fastify/static. All unit and E2E tests pass.
**Files**: src/main.ts, package.json, package-lock.json

---

### R-002 | 2026-02-23
**Type**: setup
**Tags**: #system #onboarding
**Request**: "Project onboarding via /wogi-onboard (rescan mode)"
**Result**: Analyzed existing codebase against reference patterns. Found 9 infrastructure gaps. Created backlog tasks. Updated config with quality gates, commit rules, and onboard metadata.
**Files**: .workflow/config.json, .workflow/state/ready.json, .workflow/state/decisions.md

---

### R-001 | 2026-02-23
**Type**: setup
**Tags**: #system
**Request**: "Initialize WogiFlow with reference import from comment-microservice"
**Result**: Project configured with NestJS 11 + Fastify + Prisma + PostgreSQL + Swagger + class-validator. 22 patterns imported from reference project.
**Files**: .workflow/*, .claude/*
