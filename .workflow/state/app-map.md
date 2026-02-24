# Application Component Map

<!-- PINS: overview, modules, controllers, services, managers, dto, types, decorators, exceptions, common -->

## Overview
<!-- PIN: overview -->
This file tracks all components in the chat-microservice-2 application.
Architecture follows reference patterns from comment-microservice.

## Modules
<!-- PIN: modules -->

| Module | Purpose | File | Status |
|--------|---------|------|--------|
| AppModule | Root module, imports PrismaModule + ConversationModule | src/app.module.ts | Active |
| PrismaModule | Database access, exports PrismaService | src/prisma/prisma.module.ts | Active |
| ConversationModule | Conversation CRUD, imports PrismaModule | src/conversation/conversation.module.ts | Active |

## Controllers
<!-- PIN: controllers -->

| Controller | Route | Method | Module | File |
|------------|-------|--------|--------|------|
| AppController | / | GET | AppModule | src/app.controller.ts |
| CreateConversationController | /api/conversation | POST | ConversationModule | src/conversation/controllers/create-conversation.controller.ts |
| ListConversationController | /api/conversation | GET | ConversationModule | src/conversation/controllers/list-conversation.controller.ts |
| GetConversationController | /api/conversation/:id | GET | ConversationModule | src/conversation/controllers/get-conversation.controller.ts |
| UpdateConversationController | /api/conversation/:id | PATCH | ConversationModule | src/conversation/controllers/update-conversation.controller.ts |
| DeleteConversationController | /api/conversation/:id | DELETE | ConversationModule | src/conversation/controllers/delete-conversation.controller.ts |

**Base class:** `BaseController` — shared base for all feature controllers (`src/conversation/controllers/base.controller.ts`)

## Services
<!-- PIN: services -->

| Service | Module | File | Status |
|---------|--------|------|--------|
| AppService | AppModule | src/app.service.ts | Active |
| PrismaService | PrismaModule | src/prisma/prisma.service.ts | Active |
| ConversationService | ConversationModule | src/conversation/conversation.service.ts | Active |

## DTOs
<!-- PIN: dto -->

| DTO | Module | File | Validates |
|-----|--------|------|-----------|
| CreateConversationDto | ConversationModule | src/conversation/dto/create-conversation.dto.ts | title?, type?, participantIds |
| UpdateConversationDto | ConversationModule | src/conversation/dto/update-conversation.dto.ts | title?, type? (PartialType) |

## Common
<!-- PIN: common -->

| Component | Purpose | File |
|-----------|---------|------|
| MODE constants | Environment modes (LOCAL, INTEGRATED) | src/common/constants/mode.ts |
| LocalApiProperty | Conditional Swagger docs for LOCAL mode | src/common/decorators/local-api-property.decorator.ts |

## Exceptions
<!-- PIN: exceptions -->

| Exception | HTTP Status | File |
|-----------|-------------|------|
| BadRequestException | 400 | src/exeption/bad-request.exception.ts |
| NotFoundException | 404 | src/exeption/not-found.exception.ts |
| ErrorInterface | — (type) | src/exeption/error-interface.ts |

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

## Rules

1. **Before creating** -> Search this file
2. **If similar exists** -> Add variant, don't create new
3. **After creating** -> Update this file + create detail doc
