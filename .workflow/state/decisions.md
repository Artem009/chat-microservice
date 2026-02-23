# Project Decisions & Patterns

<!-- Imported from reference project: comment-microservice -->
<!-- Date: 2026-02-23 -->
<!-- Rescanned via /wogi-onboard: 2026-02-23 -->

## Current Project State
<!-- PIN: current-state -->
**Status**: Maintenance (with accelerated development goal)
**Codebase**: NestJS 11 scaffold (5 source files)
**Module system**: `nodenext` (tsconfig) — differs from reference (`commonjs`)
**HTTP adapter**: Express (default) — reference uses Fastify
**Database**: Not configured — reference uses PostgreSQL + Prisma
**Gaps**: 9 infrastructure gaps identified (see backlog tasks)

<!-- PINS: architecture, modules, controllers, services, managers, dto, types, api-response, routing, prisma, exceptions, swagger, decorators, naming, validation, error-handling, testing, docker -->

## Architecture Patterns
<!-- PIN: architecture -->

### Module Organization
<!-- PIN: modules -->
- **Feature-based modules**: Each domain entity gets its own module directory (`comment/`, `reaction/`, `mention/`)
- Module directory contains: `*.module.ts`, `*.service.ts`, `controllers/`, `dto/`
- Shared module (`prisma/`) is imported by feature modules via `PrismaModule`
- Root `AppModule` imports all feature modules

### Controller Pattern: One Controller Per Action
<!-- PIN: controllers -->
- Each CRUD action gets its own controller file: `create-*.controller.ts`, `get-*.controller.ts`, `list-*.controller.ts`, `update-*.controller.ts`, `delete-*.controller.ts`
- All action controllers extend a `BaseController` class
- `BaseController` injects all shared dependencies (`service`, `manager`, related services)
- Dependencies in base use `protected readonly` access modifier
- Each action controller re-declares `@ApiTags` and `@ApiSecurity` decorators
- All controllers share the same route prefix: `@Controller('api/<resource>')`

### Service Layer
<!-- PIN: services -->
- Services are thin wrappers around Prisma client calls
- Service methods return Prisma promises directly (no await unless needed)
- Service constructor injects `PrismaService` with `private readonly`
- Common methods: `create()`, `findAll()`, `findOne()`, `update()`, `remove()`, `countBy()`
- Use Prisma-generated types for input: `Prisma.<Model>CreateInput`, `Prisma.<Model>UpdateInput`

### Manager Pattern
<!-- PIN: managers -->
- `CommentManager` class handles cross-service orchestration logic
- Manager is `@Injectable()` and injects multiple services
- Manager methods are arrow functions (class properties): `checkCommentExist = async (...) => { ... }`
- Used for: existence checks, mention handling, reaction aggregation, data enrichment
- Controllers call manager methods instead of writing orchestration logic inline

## Code Style
<!-- PIN: naming -->

### Naming Conventions
- **Files**: kebab-case (`create-comment.controller.ts`, `mention-add.dto.ts`)
- **Classes**: PascalCase (`CreateCommentController`, `CommentService`)
- **DTO files**: `<action>-<resource>.dto.ts` or `<descriptive-name>.dto.ts`
- **Type files**: `<resource>Types.ts` in `common/types/`
- **Constants**: UPPER_CASE objects with `as const` (`ENV_MODE`)

### DTO Pattern
<!-- PIN: dto -->
- DTOs use `class-validator` decorators: `@IsNotEmpty()`, `@IsString()`, `@IsOptional()`
- DTOs use `@ApiProperty` from `@nestjs/swagger` for documentation
- Required fields use `!:` (definite assignment assertion)
- Optional fields use `?:` (optional property)
- Update DTOs extend `PartialType(CreateDto)` from `@nestjs/mapped-types`
- Custom `@LocalApiProperty` decorator for fields visible only in LOCAL mode
- Validator order: `@ApiProperty` or `@LocalApiProperty` first, then `@IsNotEmpty()`/`@IsOptional()`, then `@IsString()`

### Type Definitions
<!-- PIN: types -->
- Custom types defined in `src/common/types/<resource>Types.ts`
- Use `type` keyword (not `interface`) for data shapes
- Named exports at bottom of file: `export { TypeA, TypeB }`
- Types are imported by services and managers

## API Patterns
<!-- PIN: api-response -->

### Response Envelope
- All responses wrapped in `{ data: ... }` envelope
- List responses: `{ data: [...], mentions: [...] }`
- Create/update responses: `{ data: ..., mentions?: [...] }`
- Delete responses: `{ data: ..., message: 'Comment deleted' }`
- Error responses use custom exception classes with `{ message, error, createdAt }`

### Routing
<!-- PIN: routing -->
- Route prefix: `api/<resource>` (e.g., `api/comment`, `api/reaction`)
- CRUD mapping: `POST /` create, `GET /` list, `GET /:id` get, `PATCH /:id` update, `DELETE /:id` delete
- Query params for filtering and relations (`withParent`, `withChildren`, `reactionsLimit`)
- `currentUser` / `currentUserId` passed as query param or body field

## Database
<!-- PIN: prisma -->

### Prisma Schema Organization
- Split schema: `prisma/base.prisma` (generator + datasource) + `prisma/models/*.prisma` (one file per model)
- Merge script: `prisma/merge.ts` concatenates base + models into `schema.prisma`
- NPM scripts: `prisma:merge`, `prisma:generate`, `prisma:migrate:new`, `prisma:migrate:apply`
- Shortcut: `prisma:short-cut:create` runs merge + generate + migrate

### Prisma Model Conventions
- UUID primary keys: `id String @id @default(uuid())`
- Timestamps: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`
- Soft delete: `deletedAt DateTime?`
- Table mapping: `@@map("lowercase_table_name")`
- Composite unique constraints: `@@unique([field1, field2, field3])`
- Relations with cascade: `onDelete: Cascade`
- JSON fields for aggregated data: `reactionsCount Json?`

### PrismaService
- Extends `PrismaClient` directly
- Implements `OnModuleInit` and `OnModuleDestroy`
- `$connect()` on init, `$disconnect()` on destroy
- Exported via `PrismaModule` with `exports: [PrismaService]`

## Error Handling
<!-- PIN: exceptions -->

### Custom Exception Classes
- Located in root `exeption/` directory (note: typo in original, kept for compatibility)
- `BadRequestException` and `NotFoundException` extend `HttpException`
- Structured response: `{ message, error: 'snake_case_error_name', createdAt: new Date(), ...additionalFields }`
- Error interface prevents overriding reserved fields (`message`, `error`, `createdAt` marked as `never`)
- Barrel export via `index.ts`

## Swagger
<!-- PIN: swagger -->

### Swagger Configuration
- Setup in `main.ts` with `DocumentBuilder`
- API key security via `authorization` header
- Swagger UI at `/api-docs`
- `persistAuthorization: true` in swagger options
- Every controller decorated with `@ApiTags('<resource>')` and `@ApiSecurity('authorization')`

## Custom Decorators
<!-- PIN: decorators -->

### LocalApiProperty
- Conditionally shows API property in Swagger based on `MODE` environment variable
- Only visible when `process.env.MODE === 'LOCAL'`
- Used for fields like `currentUserId` that come from auth in production but need manual input locally
- Composes `@IsString()` + conditional `@ApiProperty()`

## Validation
<!-- PIN: validation -->

### Global Validation Pipe
- Configured in `main.ts` with `ValidationPipe`
- `whitelist: true` — strips unexpected fields
- `forbidNonWhitelisted: true` — rejects requests with unexpected fields
- `transform: true` — auto-converts payloads to DTO types

## Testing
<!-- PIN: testing -->

### Test Setup
- Unit tests: `*.spec.ts` alongside source files
- E2E tests: `test/*.e2e-spec.ts`
- Jest with `ts-jest` transformer
- `@nestjs/testing` for module creation
- Supertest for HTTP assertions in E2E

## Docker
<!-- PIN: docker -->

### Docker Compose
- PostgreSQL 17 Alpine image
- Named container matching project name
- Environment variables for DB credentials
- Port mapping: `5432:5432`
