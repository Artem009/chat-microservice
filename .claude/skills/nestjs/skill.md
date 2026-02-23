# NestJS 11 Skill

## Overview
NestJS is a TypeScript framework for building server-side applications with dependency injection and decorators.

## Key Patterns (from reference project)
- Feature-based module organization
- One controller per CRUD action extending a base controller
- Thin services wrapping Prisma calls
- Manager classes for cross-service orchestration
- Global ValidationPipe with whitelist, forbidNonWhitelisted, transform
- Fastify adapter instead of Express

## Anti-Patterns
- Don't put business logic in controllers
- Don't skip @Injectable() decorator on services
- Don't use Express-specific APIs when using Fastify adapter
- Don't create circular module dependencies

## Conventions
- All modules import PrismaModule for database access
- Services use `private readonly` for injected dependencies
- Controllers use `protected readonly` in base classes
- Every controller has @ApiTags and @ApiSecurity decorators

---
*Placeholder skill. Run `/wogi-skills refresh` to populate with Context7 documentation.*
