# Spec: wf-b4f22cbe — Add Reply Threads on Messages

## User Story
**As a** developer
**I want** reply threads on messages
**So that** users can create threaded conversations and receive thread-specific events

## Design Decision
Add optional `parentMessageId` to the Message model as a self-referencing relation. Thread replies are regular messages with `parentMessageId` set. A thread endpoint lists all replies for a parent message. WebSocket events notify when thread activity occurs. No separate Thread model — threads are implicit from messages with the same `parentMessageId`.

## Acceptance Criteria

### Scenario 1: Create a reply (threaded message)
**Given** POST /api/message with content, conversationId, senderId, and `parentMessageId`
**When** the message is created
**Then** the reply is stored with `parentMessageId` set
**And** the parent message must exist and belong to the same conversation
**And** returns `{ data: message }` (same as normal message creation)
**And** broadcasts `newMessage` event via WebSocket (existing behavior)
**And** broadcasts `threadReply` event to the conversation room with `{ parentMessageId, reply: message }`

### Scenario 2: List thread replies
**Given** GET /api/message/thread/:parentMessageId
**When** a valid parentMessageId is provided
**Then** returns all non-deleted replies sorted by createdAt ascending
**And** returns `{ data: replies[] }`

### Scenario 3: Get thread summary (reply count)
**Given** GET /api/message/:id (existing endpoint)
**When** a message that has replies is fetched
**Then** the response includes `_count: { replies: number }` or `replyCount: number`

### Scenario 4: Nested replies are flat (no deep nesting)
**Given** a reply to a message (parentMessageId = msg-1)
**When** another user replies to that reply
**Then** the `parentMessageId` is set to the ORIGINAL parent (msg-1), not the reply
**And** this keeps all thread replies flat under the same parent

### Scenario 5: Unit tests
**Given** the thread feature is implemented
**When** tests are run
**Then** reply creation is tested (valid parent, invalid parent, wrong conversation, self-referencing)
**And** thread listing is tested
**And** reply count inclusion is tested
**And** WebSocket threadReply broadcast is tested

## Implementation Steps

### Step 1: Prisma schema
- Add `parentMessageId String?` to Message model
- Add self-relation: `parentMessage Message? @relation("ThreadReplies", fields: [parentMessageId], references: [id])` and `replies Message[] @relation("ThreadReplies")`
- Add `@@index([parentMessageId])` for thread queries
- Run prisma:merge, prisma:generate, create migration

### Step 2: Update CreateMessageDto
- Add optional `parentMessageId?: string` field with @IsOptional() + @IsString() + @ApiProperty

### Step 3: Update CreateMessageController
- After creating message, if `parentMessageId` is set:
  1. Validate parent exists and belongs to same conversation
  2. If the parent itself has a `parentMessageId`, use that instead (flatten nested replies)
  3. Broadcast `threadReply` event: `{ parentMessageId, reply: message }`

### Step 4: Create ListThreadController
- New controller: `src/message/controllers/list-thread.controller.ts`
- GET /api/message/thread/:parentMessageId
- Returns all replies (non-deleted) sorted by createdAt ASC

### Step 5: Update GetMessageController (reply count)
- Include `_count: { replies: true }` in Prisma query for findOne
- Or add a `replyCount` field in the response

### Step 6: Tests
- Add thread tests to `src/message/message.spec.ts`

## Files to Create
| File | Purpose |
|------|---------|
| `src/message/controllers/list-thread.controller.ts` | GET /api/message/thread/:parentMessageId |

## Files to Modify
| File | Change |
|------|--------|
| `prisma/models/message.prisma` | Add parentMessageId + self-relation + index |
| `src/message/dto/create-message.dto.ts` | Add optional parentMessageId field |
| `src/message/controllers/create-message.controller.ts` | Validate parent, flatten nesting, broadcast threadReply |
| `src/message/controllers/get-message.controller.ts` | Include reply count |
| `src/message/message.service.ts` | Add findReplies() method, update findOne to include _count |
| `src/message/message.module.ts` | Register ListThreadController |
| `src/message/message.spec.ts` | Add thread tests |

## Boundaries (DO NOT modify)
- `src/chat-gateway/chat.gateway.ts` — No changes (broadcastToRoom already sufficient)
- `src/mention/` — No changes needed
- `src/reaction/` — No changes needed
- `src/participant/` — No changes needed
- `src/conversation/` — No changes needed

## Verification Commands
```bash
npx tsc --noEmit
npm run lint
npm test
```
