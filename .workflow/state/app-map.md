# Application Component Map

<!-- PINS: overview, modules, controllers, services, managers, dto, types, decorators, exceptions -->

## Overview
<!-- PIN: overview -->
This file tracks all components in the chat-microservice-2 application.
Architecture follows reference patterns from comment-microservice.

## Modules

| Module | Purpose | Status |
|--------|---------|--------|
| AppModule | Root module, imports all feature modules | Scaffold |
| PrismaModule | Database access, exports PrismaService | To build |

## Controllers

| Controller | Route | Method | Status |
|------------|-------|--------|--------|
| AppController | / | GET | Scaffold |

## Services

| Service | Module | Status |
|---------|--------|--------|
| AppService | AppModule | Scaffold |

## Reference Patterns (from comment-microservice)

### Module Structure Pattern
```
src/<feature>/
  <feature>.module.ts
  <feature>.service.ts
  <feature>.manager.ts        (if cross-service orchestration needed)
  controllers/
    base.controller.ts
    create-<feature>.controller.ts
    get-<feature>.controller.ts
    list-<feature>s.controller.ts
    update-<feature>.controller.ts
    delete-<feature>.controller.ts
  dto/
    create-<feature>.dto.ts
    update-<feature>.dto.ts
    <filter-name>.dto.ts
```

### Shared Structure Pattern
```
src/common/
  types/<resource>Types.ts
  constants/mode.ts
  decorators/local-api-property.decorator.ts
src/prisma/
  prisma.module.ts
  prisma.service.ts
exeption/
  index.ts
  bad_request_exception.exception.ts
  not-found-exception.exception.ts
  errorInterface.ts
```

## Rules

1. **Before creating** -> Search this file
2. **If similar exists** -> Add variant, don't create new
3. **After creating** -> Update this file + create detail doc
