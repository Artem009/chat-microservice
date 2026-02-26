# Spec: wf-typing-presence — Add typing indicators and online presence

## User Story
**As a** developer
**I want** typing indicators and presence tracking
**So that** users see who is online and who is currently typing

## Design Decisions
- **userId added to JoinRoomDto** — gateway maps clientId→userId on join
- **Ephemeral only** — all typing/presence state lives in-memory Maps, no DB persistence
- **Broadcast excludes sender** — typing/presence events are NOT sent back to the originating client
- **Multi-device support** — one userId can have multiple WS clients; user goes "offline" only when ALL clients disconnect

## Acceptance Criteria

### Scenario 1: Typing indicator broadcast
**Given** a client has joined a conversation with userId
**When** the client emits "typing" with { conversationId, userId }
**Then** the gateway broadcasts "userTyping" { conversationId, userId } to OTHER participants in the room (not the sender)

### Scenario 2: Stop typing broadcast
**Given** a client has joined a conversation with userId
**When** the client emits "stopTyping" with { conversationId, userId }
**Then** the gateway broadcasts "userStoppedTyping" { conversationId, userId } to OTHER participants in the room

### Scenario 3: Online presence on join
**Given** a client connects via WebSocket
**When** they emit "joinConversation" with { conversationId, userId }
**Then** the gateway stores the clientId→userId mapping
**And** broadcasts "presenceUpdate" { userId, status: "online" } to other clients in the room

### Scenario 4: Offline presence on disconnect
**Given** a connected client with userId who has joined conversations
**When** the WebSocket connection closes
**Then** the gateway clears all typing state for that client
**And** if no other clients share the same userId, broadcasts "presenceUpdate" { userId, status: "offline" } to all rooms the client was in

## Technical Notes

### Files to Create
1. `src/chat-gateway/dto/typing.dto.ts` — TypingDto with conversationId + userId

### Files to Modify
1. `src/chat-gateway/dto/join-room.dto.ts` — add userId field
2. `src/chat-gateway/chat.gateway.ts` — add typing/presence handlers + new Maps
3. `src/chat-gateway/chat-gateway.spec.ts` — add tests for new handlers

### New Data Structures (in ChatGateway)
```typescript
// Maps clientId → userId (set on joinConversation)
private readonly clientUserMap = new Map<string, string>();
// Maps userId → Set<clientId> (for multi-device detection)
private readonly userClients = new Map<string, Set<string>>();
// Maps conversationId → Set<userId> (who is currently typing)
private readonly typingUsers = new Map<string, Set<string>>();
```

### New Event Handlers
- `handleTyping(@MessageBody() data: TypingDto, @ConnectedSocket() client)` — @SubscribeMessage('typing')
- `handleStopTyping(@MessageBody() data: TypingDto, @ConnectedSocket() client)` — @SubscribeMessage('stopTyping')

### Modified Handlers
- `handleJoinConversation` — accept userId, store in clientUserMap/userClients, broadcast presenceUpdate
- `handleDisconnect` — clear typing state, broadcast offline if last client for userId

### Broadcast Helper
- `broadcastToRoomExcluding(conversationId, excludeClientId, event, payload)` — sends to all room members except sender

### Boundaries (do NOT modify)
- prisma/models/* — no DB changes needed
- src/message/* — no changes needed
- src/participant/* — no changes needed
- src/conversation/* — no changes needed

## Test Strategy
- Test typing broadcast to room (sender excluded)
- Test stopTyping broadcast
- Test presenceUpdate on join (online)
- Test presenceUpdate on disconnect (offline)
- Test multi-device: 2 clients same userId, disconnect one → no offline broadcast
- Test multi-device: disconnect both → offline broadcast
- Test typing cleanup on disconnect
- Test typing in non-joined room is no-op

## Verification Commands
```bash
npx tsc --noEmit
npm run lint
npm run test
```
