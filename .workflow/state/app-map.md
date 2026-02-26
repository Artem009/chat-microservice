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
| AppModule | Root module, imports PrismaModule + ConversationModule + MessageModule + ParticipantModule | src/app.module.ts | Active |
| PrismaModule | Database access, exports PrismaService | src/prisma/prisma.module.ts | Active |
| ConversationModule | Conversation CRUD, imports PrismaModule | src/conversation/conversation.module.ts | Active |
| MessageModule | Message CRUD scoped to conversations, imports PrismaModule | src/message/message.module.ts | Active |
| ParticipantModule | Participant management (add/remove/role), imports PrismaModule | src/participant/participant.module.ts | Active |
| ChatGatewayModule | WebSocket gateway for real-time messaging, exports ChatGateway | src/chat-gateway/chat-gateway.module.ts | Active |

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
| CreateMessageController | /api/message | POST | MessageModule | src/message/controllers/create-message.controller.ts |
| ListMessageController | /api/message | GET | MessageModule | src/message/controllers/list-message.controller.ts |
| GetMessageController | /api/message/:id | GET | MessageModule | src/message/controllers/get-message.controller.ts |
| UpdateMessageController | /api/message/:id | PATCH | MessageModule | src/message/controllers/update-message.controller.ts |
| DeleteMessageController | /api/message/:id | DELETE | MessageModule | src/message/controllers/delete-message.controller.ts |
| AddParticipantController | /api/participant | POST | ParticipantModule | src/participant/controllers/add-participant.controller.ts |
| ListParticipantController | /api/participant | GET | ParticipantModule | src/participant/controllers/list-participant.controller.ts |
| UpdateParticipantController | /api/participant/:id | PATCH | ParticipantModule | src/participant/controllers/update-participant.controller.ts |
| RemoveParticipantController | /api/participant/:id | DELETE | ParticipantModule | src/participant/controllers/remove-participant.controller.ts |
| MarkReadController | /api/message/read | POST | MessageModule | src/message/controllers/mark-read.controller.ts |

**Base classes:** `BaseController` — per-module base for feature controllers (`src/conversation/controllers/base.controller.ts`, `src/message/controllers/base.controller.ts`, `src/participant/controllers/base.controller.ts`)

## Services
<!-- PIN: services -->

| Service | Module | File | Status |
|---------|--------|------|--------|
| AppService | AppModule | src/app.service.ts | Active |
| PrismaService | PrismaModule | src/prisma/prisma.service.ts | Active |
| ConversationService | ConversationModule | src/conversation/conversation.service.ts | Active |
| MessageService | MessageModule | src/message/message.service.ts | Active |
| ParticipantService | ParticipantModule | src/participant/participant.service.ts | Active |

## Gateways
<!-- PIN: gateways -->

| Gateway | Events | Module | File |
|---------|--------|--------|------|
| ChatGateway | joinConversation, leaveConversation, typing, stopTyping, newMessage (broadcast), userTyping (broadcast), userStoppedTyping (broadcast), presenceUpdate (broadcast), readReceipt (broadcast) | ChatGatewayModule | src/chat-gateway/chat.gateway.ts |

## DTOs
<!-- PIN: dto -->

| DTO | Module | File | Validates |
|-----|--------|------|-----------|
| CreateConversationDto | ConversationModule | src/conversation/dto/create-conversation.dto.ts | title?, type?, participantIds |
| UpdateConversationDto | ConversationModule | src/conversation/dto/update-conversation.dto.ts | title?, type? (PartialType) |
| CreateMessageDto | MessageModule | src/message/dto/create-message.dto.ts | content, conversationId, senderId |
| UpdateMessageDto | MessageModule | src/message/dto/update-message.dto.ts | content? |
| AddParticipantDto | ParticipantModule | src/participant/dto/add-participant.dto.ts | conversationId, userId, role? |
| UpdateParticipantDto | ParticipantModule | src/participant/dto/update-participant.dto.ts | role |
| JoinRoomDto | ChatGatewayModule | src/chat-gateway/dto/join-room.dto.ts | conversationId, userId |
| TypingDto | ChatGatewayModule | src/chat-gateway/dto/typing.dto.ts | conversationId, userId |
| MarkReadDto | MessageModule | src/message/dto/mark-read.dto.ts | conversationId, userId, lastReadMessageId |

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
| ConflictException | 409 | src/exeption/conflict.exception.ts |
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
