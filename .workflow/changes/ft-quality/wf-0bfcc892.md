# Story: Add Integration Tests (E2E) for all API endpoints and WebSocket events

## User Story
As a developer, I want comprehensive E2E tests covering all REST endpoints and WebSocket events, so that I can confidently add new features without breaking existing functionality.

## Description
Add end-to-end integration tests that exercise the full NestJS application stack (Fastify + Prisma + WebSocket). Tests should create a real NestJS app instance with a mock PrismaService, call actual HTTP endpoints via supertest, and test WebSocket events via the ws client. This ensures all modules, controllers, services, validation pipes, and the gateway work correctly when wired together.

## Acceptance Criteria

### Scenario 1: Conversation CRUD E2E
Given a running NestJS application
When I send HTTP requests to conversation endpoints
Then POST /api/conversation creates and returns a conversation
And GET /api/conversation lists conversations
And GET /api/conversation/:id returns a single conversation
And PATCH /api/conversation/:id updates the conversation
And DELETE /api/conversation/:id soft-deletes the conversation

### Scenario 2: Message CRUD E2E
Given a running NestJS application
When I send HTTP requests to message endpoints
Then POST /api/message creates a message in a conversation
And GET /api/message?conversationId=X lists messages with pagination
And GET /api/message/:id returns a single message with conversation
And PATCH /api/message/:id updates message content
And DELETE /api/message/:id soft-deletes the message

### Scenario 3: Mark Read E2E
Given a running NestJS application
When I POST /api/message/read with conversationId, userId, lastReadMessageId
Then the participant's lastReadMessageId is updated
And a readReceipt event is broadcast via WebSocket

### Scenario 4: Participant Management E2E
Given a running NestJS application
When I send HTTP requests to participant endpoints
Then POST /api/participant adds a participant to a conversation
And GET /api/participant?conversationId=X lists active participants
And PATCH /api/participant/:id updates participant role
And DELETE /api/participant/:id soft-removes the participant

### Scenario 5: Validation E2E
Given a running NestJS application with ValidationPipe
When I send invalid payloads (missing required fields, wrong types)
Then the API returns 400 Bad Request with validation errors
And extra fields are stripped (whitelist: true)

### Scenario 6: WebSocket Gateway E2E
Given a running NestJS application with WsAdapter
When a client connects and sends joinConversation with conversationId and userId
Then the client is added to the room
And when typing/stopTyping events are sent
Then userTyping/userStoppedTyping events are broadcast to the room
And when a client disconnects
Then presenceUpdate offline is broadcast

## Technical Notes

### Approach
- Use `@nestjs/testing` TestingModule with full AppModule import
- Configure `FastifyAdapter` + `WsAdapter` in test setup (matching main.ts)
- Apply `ValidationPipe` globally (matching main.ts)
- Mock `PrismaService` with jest.fn() stubs (no real database required)
- Use `supertest` for HTTP endpoint testing
- Use `ws` package (already installed via @nestjs/platform-ws) for WebSocket testing
- Each test file should `beforeAll` create app + `afterAll` close app

### Test File Structure
```
test/
  jest-e2e.json              (existing)
  app.e2e-spec.ts            (existing — update)
  conversation.e2e-spec.ts   (new)
  message.e2e-spec.ts        (new)
  participant.e2e-spec.ts    (new)
  websocket.e2e-spec.ts      (new)
```

### Components to Reuse
- AppModule (imports all modules)
- All existing DTOs (validation is tested via real ValidationPipe)
- PrismaService (mocked)

### Boundaries
- Do NOT modify any source files (src/**)
- Do NOT create a test database or run real migrations
- Do NOT modify jest-e2e.json (existing config is sufficient)

## Test Strategy
- **E2E (this story)**: Full app integration via HTTP + WebSocket
- **Unit tests**: Already exist (96 tests) — must continue to pass

## Dependencies
- All domain modules complete (conversation, message, participant, chat-gateway)

## Feature
ft-quality

## Plan
pl-bee7a44d

## Complexity
High (16+ REST endpoints + WebSocket events across 4 test files)

## Priority
P1
