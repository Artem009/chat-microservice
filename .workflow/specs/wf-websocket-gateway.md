# Spec: wf-websocket-gateway — Create WebSocket gateway for real-time messaging

## User Story
**As a** developer
**I want** a WebSocket gateway using @nestjs/websockets with ws adapter
**So that** clients receive messages in real-time without polling

## Decisions
- **Adapter**: @nestjs/platform-ws (pure WebSocket, Fastify-compatible)
- **Auth**: No authentication for MVP (separate task later)
- **Room management**: Manual Map/Set (ws has no built-in rooms)
- **REST→WS bridge**: Direct service injection (ChatGateway injects MessageService event flow)

## Acceptance Criteria

### Scenario 1: Install WebSocket packages and configure adapter
**Given** the project uses NestJS 11 + Fastify
**When** @nestjs/websockets and @nestjs/platform-ws are installed
**Then** the WsAdapter is configured in main.ts
**And** the app starts without errors

### Scenario 2: ChatGateway handles connection/disconnection
**Given** the ChatGateway is registered with @WebSocketGateway()
**When** a client connects via WebSocket
**Then** the gateway logs the connection
**And** tracks the client in a connected clients map
**When** a client disconnects
**Then** the client is removed from all rooms and the connected clients map

### Scenario 3: Join conversation room
**Given** a client is connected via WebSocket
**When** they send a "joinConversation" message with { conversationId }
**Then** the client is added to the conversation room
**And** the gateway confirms with a "joinedConversation" response

### Scenario 4: Leave conversation room
**Given** a client is in a conversation room
**When** they send a "leaveConversation" message with { conversationId }
**Then** the client is removed from the room
**And** the gateway confirms with a "leftConversation" response

### Scenario 5: Broadcast new messages via REST→WS bridge
**Given** clients are in a conversation room
**When** a message is created via POST /api/message
**Then** the ChatGateway broadcasts the new message to all clients in that conversation room
**And** the broadcast event is "newMessage" with the full message data

## Implementation Steps

1. Install packages: `@nestjs/websockets`, `@nestjs/platform-ws`
2. Configure WsAdapter in `src/main.ts`
3. Create `src/chat-gateway/chat-gateway.module.ts`
4. Create `src/chat-gateway/chat.gateway.ts` with:
   - @WebSocketGateway() decorator
   - handleConnection / handleDisconnection lifecycle
   - @SubscribeMessage('joinConversation') handler
   - @SubscribeMessage('leaveConversation') handler
   - broadcastToRoom() method for sending messages to room members
5. Create `src/chat-gateway/dto/join-room.dto.ts` with conversationId validation
6. Modify `src/message/controllers/create-message.controller.ts` to inject ChatGateway and call broadcast after message creation
7. Wire ChatGatewayModule into AppModule
8. Create unit tests in `src/chat-gateway/chat-gateway.spec.ts`

## Files to Create
- `src/chat-gateway/chat-gateway.module.ts` — Module definition
- `src/chat-gateway/chat.gateway.ts` — WebSocket gateway class
- `src/chat-gateway/dto/join-room.dto.ts` — DTO for room join/leave
- `src/chat-gateway/chat-gateway.spec.ts` — Unit tests

## Files to Modify
- `src/main.ts` — Add WsAdapter configuration
- `src/message/controllers/create-message.controller.ts` — Inject ChatGateway, call broadcast
- `src/message/controllers/base.controller.ts` — Add ChatGateway to base dependencies
- `src/message/message.module.ts` — Import ChatGatewayModule
- `src/app.module.ts` — Import ChatGatewayModule
- `package.json` — Add @nestjs/websockets, @nestjs/platform-ws

## Boundaries (DO NOT modify)
- `src/conversation/` — No changes needed
- `src/participant/` — No changes needed
- `src/prisma/` — No changes needed
- `src/exeption/` — No changes needed
- `prisma/` — No schema changes

## Verification Commands
```bash
npx tsc --noEmit
npx eslint src/chat-gateway/**/*.ts --fix
npx eslint src/message/**/*.ts --fix
npm test
```

## Test Strategy
- Mock WebSocket clients for gateway unit tests
- Test room join/leave logic with Map/Set
- Test broadcast reaches correct room members
- Test create-message controller triggers broadcast
