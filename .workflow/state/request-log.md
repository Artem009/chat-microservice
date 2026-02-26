# Request Log

This file tracks all changes made to the project.

---

### R-021 | 2026-02-26
**Type**: feature
**Tags**: #domain #mentions #notifications #websocket
**Request**: "Add @mentions in messages (wf-7ed59642)"
**Result**: Created Mention Prisma model with unique constraint [messageId, mentionedUserId]. Added mentions relation on Message model. Created MentionModule with MentionService (createMany/findByMessage/findByUser), mention-parser.ts pure function (extracts @<uuid> patterns, deduplicates, case-normalizes). ListMentionController GET /api/mention?messageId=&userId= with Swagger @ApiQuery. Extended CreateMessageController to parse mentions from content, filter active participants (via ParticipantService.findByConversation), exclude sender, create Mention records, broadcast `userMentioned` WebSocket event. 17 new tests (127 total). All pass. TypeScript clean. Lint clean.
**Files**: prisma/models/mention.prisma, prisma/models/message.prisma, src/mention/mention.module.ts, src/mention/mention.service.ts, src/mention/mention-parser.ts, src/mention/controllers/base.controller.ts, src/mention/controllers/list-mention.controller.ts, src/mention/mention.spec.ts, src/message/controllers/create-message.controller.ts, src/message/message.module.ts, src/message/message.spec.ts, src/app.module.ts

---

### R-020 | 2026-02-26
**Type**: feature
**Tags**: #domain #reactions #messages #websocket
**Request**: "Add emoji reactions to messages (wf-db336127)"
**Result**: Created Reaction Prisma model with composite unique constraint [messageId, userId, emoji]. Added reactions relation on Message model. Created ReactionModule with ReactionService (create/findAll/findOne/remove), 3 controllers: CreateReactionController (POST /api/reaction — validates message exists, handles P2002 unique constraint → ConflictException, broadcasts reactionAdded), DeleteReactionController (DELETE /api/reaction/:id — hard delete, broadcasts reactionRemoved), ListReactionController (GET /api/reaction?messageId=). Created CreateReactionDto with class-validator + Swagger. WebSocket broadcasts reactionAdded/reactionRemoved to conversation room. 14 new tests (110 total). All pass. TypeScript clean. Lint clean.
**Files**: prisma/models/reaction.prisma, prisma/models/message.prisma, src/reaction/reaction.module.ts, src/reaction/reaction.service.ts, src/reaction/dto/create-reaction.dto.ts, src/reaction/controllers/base.controller.ts, src/reaction/controllers/create-reaction.controller.ts, src/reaction/controllers/delete-reaction.controller.ts, src/reaction/controllers/list-reaction.controller.ts, src/reaction/reaction.spec.ts, src/app.module.ts

---

### R-019 | 2026-02-26
**Type**: feature
**Tags**: #domain #typing #presence #websocket
**Request**: "Add typing indicators and online presence (wf-typing-presence)"
**Result**: Extended ChatGateway with typing indicators and online presence. Added userId to JoinRoomDto. Created TypingDto (conversationId + userId). Added 3 new Maps: clientUserMap (clientId→userId), userClients (userId→Set<clientId>), typingUsers (conversationId→Set<userId>). Added broadcastToRoomExcluding() helper that excludes sender. New WS handlers: typing→broadcasts userTyping, stopTyping→broadcasts userStoppedTyping. Modified joinConversation to store userId mapping and broadcast presenceUpdate online. Modified handleDisconnect to clear typing state and broadcast presenceUpdate offline (multi-device aware — only broadcasts offline when last client disconnects). 9 new tests (96 total). All pass. TypeScript clean. Lint clean.
**Files**: src/chat-gateway/dto/typing.dto.ts, src/chat-gateway/dto/join-room.dto.ts, src/chat-gateway/chat.gateway.ts, src/chat-gateway/chat-gateway.spec.ts

---

### R-018 | 2026-02-26
**Type**: feature
**Tags**: #domain #read-receipts #websocket
**Request**: "Add read receipts tracking (wf-read-receipts)"
**Result**: Added lastReadMessageId field to Participant model with relation to Message. Created MarkReadController (POST /api/message/read) that validates participant+message, updates lastReadMessageId via ParticipantService, and broadcasts readReceipt event via ChatGateway. Added ConversationService.findAllWithUnreadCount() that computes unread count per conversation excluding user's own messages. Updated ListConversationController to include unreadCount in response. Added MessageService.countUnread() helper. Imported ParticipantModule in MessageModule for cross-module injection. 9 new tests (6 mark-read + 3 countUnread). All 87 tests pass. TypeScript clean.
**Files**: prisma/models/participant.prisma, prisma/models/message.prisma, src/message/dto/mark-read.dto.ts, src/message/controllers/mark-read.controller.ts, src/message/message.module.ts, src/message/message.service.ts, src/participant/participant.service.ts, src/conversation/conversation.service.ts, src/conversation/controllers/list-conversation.controller.ts, src/message/message.spec.ts, src/conversation/conversation.spec.ts

---

### R-017 | 2026-02-25
**Type**: feature
**Tags**: #domain #websocket #realtime
**Request**: "Create WebSocket gateway for real-time messaging (wf-websocket-gateway)"
**Result**: Installed @nestjs/websockets and @nestjs/platform-ws (pure WS adapter, Fastify-compatible). Configured WsAdapter in main.ts. Created ChatGatewayModule with ChatGateway implementing OnGatewayConnection/OnGatewayDisconnect. Manual room management via Map/Set: joinConversation adds client to room, leaveConversation removes, handleDisconnect cleans up all rooms. broadcastToRoom sends JSON messages to all clients in a conversation. REST→WS bridge: CreateMessageController injects ChatGateway and calls broadcastToRoom after message creation. Updated all 5 message controllers to pass ChatGateway via BaseController. JoinRoomDto with class-validator. 14 gateway tests + 1 broadcast integration test. All 78 tests pass. TypeScript clean.
**Files**: src/chat-gateway/chat-gateway.module.ts, src/chat-gateway/chat.gateway.ts, src/chat-gateway/dto/join-room.dto.ts, src/chat-gateway/chat-gateway.spec.ts, src/message/message.module.ts, src/message/controllers/base.controller.ts, src/message/controllers/create-message.controller.ts, src/message/controllers/list-message.controller.ts, src/message/controllers/get-message.controller.ts, src/message/controllers/update-message.controller.ts, src/message/controllers/delete-message.controller.ts, src/message/message.spec.ts, src/app.module.ts, src/main.ts, package.json

---

### R-016 | 2026-02-24
**Type**: feature
**Tags**: #domain #participant #crud
**Request**: "Create Participant module with management endpoints (wf-participant-module)"
**Result**: Created participant module with 4 action controllers (add, list, update role, remove). ParticipantService with CRUD + findByConversationAndUser for duplicate detection. Add endpoint handles 3 cases: new participant (create), active duplicate (409 ConflictException), and rejoin (reset leftAt). List filters by conversationId + leftAt:null. Update changes role (ADMIN/MEMBER). Remove uses soft-delete via leftAt. Created ConflictException (409) in src/exeption/ following existing pattern. DTOs with ParticipantRole enum validation. 17 unit tests covering service + all controllers + error cases. Wired into AppModule.
**Files**: src/exeption/conflict.exception.ts, src/exeption/index.ts, src/participant/participant.module.ts, src/participant/participant.service.ts, src/participant/controllers/base.controller.ts, src/participant/controllers/add-participant.controller.ts, src/participant/controllers/list-participant.controller.ts, src/participant/controllers/update-participant.controller.ts, src/participant/controllers/remove-participant.controller.ts, src/participant/dto/add-participant.dto.ts, src/participant/dto/update-participant.dto.ts, src/participant/participant.spec.ts, src/app.module.ts

---

### R-015 | 2026-02-24
**Type**: feature
**Tags**: #domain #message #crud
**Request**: "Create Message module with CRUD (wf-message-module)"
**Result**: Created full message module following conversation module patterns: MessageService with 5 CRUD methods (create, findAll with pagination, findOne with conversation include, update, remove via soft delete). 5 action controllers (create, list, get, update, delete) extending BaseController. POST connects message to conversation via Prisma relation. GET list filters by conversationId query param with take/skip pagination. GET single includes conversation relation, throws NotFoundException if not found/soft-deleted. PATCH updates content. DELETE uses soft delete (deletedAt). DTOs with class-validator + @ApiProperty with UUID examples. All endpoints follow { data } response envelope. 15 unit tests covering service + all controllers including NotFoundException cases. Wired into AppModule.
**Files**: src/message/message.module.ts, src/message/message.service.ts, src/message/controllers/base.controller.ts, src/message/controllers/create-message.controller.ts, src/message/controllers/list-message.controller.ts, src/message/controllers/get-message.controller.ts, src/message/controllers/update-message.controller.ts, src/message/controllers/delete-message.controller.ts, src/message/dto/create-message.dto.ts, src/message/dto/update-message.dto.ts, src/message/message.spec.ts, src/app.module.ts

---

### R-014 | 2026-02-24
**Type**: change
**Tags**: #swagger #dto #documentation
**Request**: "Add Swagger example data with UUID examples to DTOs (wf-fc80a97c)"
**Result**: Added example values to all @ApiProperty/@ApiPropertyOptional decorators in CreateConversationDto and UpdateConversationDto. Examples include realistic UUIDs for participantIds and currentUserId. Removed unused LocalApiProperty import from create-conversation.dto.ts.
**Files**: src/conversation/dto/create-conversation.dto.ts, src/conversation/dto/update-conversation.dto.ts

---

### R-013 | 2026-02-23
**Type**: feature
**Tags**: #domain #conversation #crud
**Request**: "Create Conversation module with CRUD (wf-conversation-module)"
**Result**: Created full conversation module following reference patterns: ConversationService with 5 CRUD methods delegating to PrismaService. 5 action controllers (create, list, get, update, delete) extending BaseController. DTOs with class-validator + @ApiProperty + @LocalApiProperty for currentUserId. POST creates conversation with sender as ADMIN + others as MEMBER. GET list filters by currentUserId participant. GET single includes participants + recent messages. DELETE uses soft delete (deletedAt). All endpoints follow { data } response envelope. 15 unit tests covering service + all controllers including NotFoundException cases. Wired into AppModule.
**Files**: src/conversation/conversation.module.ts, src/conversation/conversation.service.ts, src/conversation/controllers/base.controller.ts, src/conversation/controllers/create-conversation.controller.ts, src/conversation/controllers/list-conversation.controller.ts, src/conversation/controllers/get-conversation.controller.ts, src/conversation/controllers/update-conversation.controller.ts, src/conversation/controllers/delete-conversation.controller.ts, src/conversation/dto/create-conversation.dto.ts, src/conversation/dto/update-conversation.dto.ts, src/conversation/conversation.spec.ts, src/app.module.ts

---

### R-012 | 2026-02-23
**Type**: feature
**Tags**: #domain #prisma #database
**Request**: "Create Prisma models for chat domain (wf-prisma-models)"
**Result**: Created 3 split Prisma schema files: conversation.prisma (Conversation model + ConversationType enum DIRECT/GROUP), message.prisma (Message model with FK to Conversation, indexes on conversationId and senderId), participant.prisma (Participant model + ParticipantRole enum ADMIN/MEMBER, unique constraint on [conversationId, userId]). All models follow conventions: UUID PKs, timestamps, @@map for snake_case tables, Cascade deletes. Migration 20260223173827_init_chat_models created. Unblocked 3 dependent tasks (wf-conversation-module, wf-message-module, wf-participant-module).
**Files**: prisma/models/conversation.prisma, prisma/models/message.prisma, prisma/models/participant.prisma, prisma/schema.prisma, prisma/migrations/20260223173827_init_chat_models/migration.sql

---

### R-011 | 2026-02-23
**Type**: refactor
**Tags**: #infrastructure #config
**Request**: "Align tsconfig module system with reference (wf-49745460)"
**Result**: Changed module from nodenext to commonjs for cross-project consistency with reference. Added strict: true (enables noImplicitAny, strictBindCallApply, strictFunctionTypes, strictPropertyInitialization, etc.). Removed redundant individual strict flags. Removed moduleResolution: nodenext and resolvePackageJsonExports. Zero type errors — codebase was already well-typed. Build, typecheck, lint, and all 17 tests pass. Developer Tooling feature (ft-27ad4502) now 100% complete (2/2 stories). Plan pl-693271de now 100% complete (9/9 stories).
**Files**: tsconfig.json

---

### R-010 | 2026-02-23
**Type**: refactor
**Tags**: #infrastructure #tooling
**Request**: "Install SWC compiler for faster builds (wf-bc6bf0fb)"
**Result**: Installed @swc/cli@0.7.10 and @swc/core@1.15.13 as devDependencies. NestJS CLI auto-detects SWC for faster TypeScript compilation. Build, typecheck, lint, and all 17 tests pass.
**Files**: package.json, package-lock.json

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
