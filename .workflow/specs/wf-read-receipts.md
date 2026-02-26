# Spec: wf-read-receipts — Add Read Receipts Tracking

## User Story
**As a** developer
**I want** read receipt tracking per participant per conversation
**So that** users can see who has read their messages

## Design Decision
Add `lastReadMessageId` field to the existing `Participant` model (not a separate ReadReceipt model). This tracks the read *position* per conversation per user.

Unread count **excludes** the user's own messages (user-confirmed).

## Acceptance Criteria

### Scenario 1: Mark messages as read
**Given** POST /api/message/read
**When** conversationId, userId, and lastReadMessageId are provided
**Then** the participant's lastReadMessageId is updated
**And** returns `{ data: updatedParticipant }`
**And** throws NotFoundException if participant not found or not active
**And** throws NotFoundException if message not found or deleted

### Scenario 2: Get unread count
**Given** GET /api/conversation?currentUserId=<uuid>
**When** conversations are returned
**Then** each conversation includes `unreadCount` (number)
**And** unreadCount counts messages where senderId != currentUserId, deletedAt is null, and createdAt > lastReadMessage.createdAt
**And** if lastReadMessageId is null, counts all messages from others

### Scenario 3: Broadcast read receipt via WebSocket
**Given** a participant marks messages as read via POST /api/message/read
**When** the read position is updated
**Then** other participants in the conversation receive a `readReceipt` event
**And** event payload: `{ conversationId, userId, lastReadMessageId }`

## Implementation Steps

### Step 1: Prisma schema changes
- Add `lastReadMessageId String?` to Participant model
- Add inverse relation on Message for lastReadBy
- Run prisma:merge, prisma:generate, create migration

### Step 2: Service layer
- Add `ParticipantService.updateLastReadMessage(conversationId, userId, messageId)` method
- Add `ConversationService.findAllWithUnreadCount(userId)` method that:
  1. Fetches conversations with participants (existing findAll)
  2. For each conversation, counts unread messages excluding user's own
  3. Returns conversations with `unreadCount` field

### Step 3: DTO + Controller
- Create `MarkReadDto` with conversationId, userId, lastReadMessageId
- Create `MarkReadController` (POST /api/message/read) in message module
  - Extends BaseController (gets MessageService + ChatGateway)
  - Also injects ParticipantService
  - Validates participant exists and is active
  - Validates message exists and not deleted
  - Updates participant's lastReadMessageId
  - Broadcasts readReceipt event

### Step 4: Conversation list enrichment
- Modify `ListConversationController` to call `findAllWithUnreadCount()`
- Response shape: `{ data: [...conversations with unreadCount] }`

### Step 5: Module wiring
- Import ParticipantModule in MessageModule (for MarkReadController)
- Import MessageModule in ConversationModule (for unread count) — NOT NEEDED, ConversationService uses PrismaService directly

### Step 6: Tests
- Unit tests for mark-read controller + unread count logic

## Files to Create
| File | Purpose |
|------|---------|
| `src/message/dto/mark-read.dto.ts` | Input validation for mark-read endpoint |
| `src/message/controllers/mark-read.controller.ts` | POST /api/message/read controller |

## Files to Modify
| File | Change |
|------|--------|
| `prisma/models/participant.prisma` | Add lastReadMessageId field + relation |
| `prisma/models/message.prisma` | Add lastReadByParticipants inverse relation |
| `src/participant/participant.service.ts` | Add updateLastReadMessage() method |
| `src/message/message.service.ts` | Add countUnread() helper method |
| `src/message/message.module.ts` | Register MarkReadController, import ParticipantModule |
| `src/conversation/conversation.service.ts` | Add findAllWithUnreadCount() method |
| `src/conversation/controllers/list-conversation.controller.ts` | Use findAllWithUnreadCount() |
| `src/message/message.spec.ts` | Add mark-read + unread count tests |

## Boundaries (DO NOT modify)
- `src/app.module.ts` — No changes needed
- `src/chat-gateway/chat.gateway.ts` — No changes needed (broadcastToRoom already sufficient)
- Existing message CRUD controllers — No changes
- Existing participant CRUD controllers — No changes

## Verification Commands
```bash
npx tsc --noEmit
npm run lint
npm test
```
