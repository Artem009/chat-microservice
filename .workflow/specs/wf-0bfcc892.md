# Spec: Add Integration Tests (E2E)

## Task
wf-0bfcc892

## Acceptance Criteria

### Scenario 1: Conversation CRUD E2E
Given a running NestJS app with mocked PrismaService
When POST /api/conversation with valid DTO → returns 201 + { data: conversation }
When GET /api/conversation?currentUserId=X → returns 200 + { data: conversations[] }
When GET /api/conversation/:id → returns 200 + { data: conversation }
When PATCH /api/conversation/:id with DTO → returns 200 + { data: conversation }
When DELETE /api/conversation/:id → returns 200 + { data: conversation, message: string }

### Scenario 2: Message CRUD E2E
Given a running NestJS app with mocked PrismaService
When POST /api/message with valid DTO → returns 201 + { data: message }
When GET /api/message?conversationId=X → returns 200 + { data: messages[] }
When GET /api/message/:id → returns 200 + { data: message }
When PATCH /api/message/:id with DTO → returns 200 + { data: message }
When DELETE /api/message/:id → returns 200 + { data: message, message: string }

### Scenario 3: Mark Read E2E
Given a running NestJS app with mocked PrismaService
When POST /api/message/read with valid MarkReadDto → returns 200 + { data: participant }

### Scenario 4: Participant Management E2E
Given a running NestJS app with mocked PrismaService
When POST /api/participant with valid DTO → returns 201 + { data: participant }
When GET /api/participant?conversationId=X → returns 200 + { data: participants[] }
When PATCH /api/participant/:id with DTO → returns 200 + { data: participant }
When DELETE /api/participant/:id → returns 200 + { data: participant, message: string }

### Scenario 5: Validation E2E
Given a running NestJS app with global ValidationPipe
When POST /api/conversation with empty body → returns 400
When POST /api/message with missing conversationId → returns 400
When POST /api/participant with invalid role → returns 400

### Scenario 6: WebSocket Gateway E2E
Given a running NestJS app with WsAdapter on a listening port
When a ws client connects → receives clientId assignment
When client sends joinConversation → receives { event: joinedConversation }
When client sends typing → other clients receive userTyping broadcast
When client disconnects → other clients receive presenceUpdate offline

## Implementation Steps

1. Create shared E2E test setup helper (app creation + Prisma mock)
2. Create test/conversation.e2e-spec.ts (5 CRUD tests + 1 not-found test)
3. Create test/message.e2e-spec.ts (5 CRUD tests + mark-read test)
4. Create test/participant.e2e-spec.ts (4 management tests + conflict test)
5. Create test/websocket.e2e-spec.ts (connection, join, typing, presence tests)
6. Update test/app.e2e-spec.ts to use FastifyAdapter (match main.ts)
7. Add validation error tests across all test files

## Files to Create/Change
- test/helpers/e2e-setup.ts (NEW — shared app setup + mock factory)
- test/conversation.e2e-spec.ts (NEW)
- test/message.e2e-spec.ts (NEW)
- test/participant.e2e-spec.ts (NEW)
- test/websocket.e2e-spec.ts (NEW)
- test/app.e2e-spec.ts (UPDATE — use FastifyAdapter)

## Boundaries
- Do NOT modify any src/** files
- Do NOT modify jest-e2e.json
- Do NOT create test database or run migrations

## Technical Notes
- Use FastifyAdapter + WsAdapter matching main.ts bootstrap
- Use .overrideProvider(PrismaService).useValue(mock) for mocking
- Use app.inject() for HTTP tests (native Fastify, no port needed)
- WS tests need app.listen(0) for dynamic port + ws client
- Call await app.getHttpAdapter().getInstance().ready() after init()
- Apply ValidationPipe globally in test setup (whitelist + transform)
- All mock data uses UUID format for IDs

## Verification Commands
- npm run test:e2e
- npx tsc --noEmit
- npm run lint
