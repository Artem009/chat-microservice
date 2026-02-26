# Project Roadmap

<!-- PINS: now, next, later, ideas, completed -->

## Now (Current Focus)
<!-- PIN: now -->

_No active tasks. All planned features complete._

---

## Next (Ready to Plan)
<!-- PIN: next -->

_No tasks in Next._

---

## Later (Future Phases)
<!-- PIN: later -->

_No items._

---

## Ideas (Exploration)
<!-- PIN: ideas -->

_No items yet._

---

## Completed
<!-- PIN: completed -->

### Add typing indicators and online presence
- **Task:** wf-typing-presence
- **Completed:** 2026-02-26
- **Type:** feature
- **Result:** userId added to JoinRoomDto, TypingDto created, 3 new Maps (clientUserMap, userClients, typingUsers), typing/stopTyping handlers with broadcastToRoomExcluding, presenceUpdate online on join / offline on disconnect (multi-device aware), 9 new tests (96 total)

### Add read receipts tracking
- **Task:** wf-read-receipts
- **Completed:** 2026-02-26
- **Type:** feature
- **Result:** lastReadMessageId on Participant, POST /api/message/read endpoint, unreadCount in conversation list, readReceipt WebSocket broadcast, 9 new tests (87 total)

### Create WebSocket gateway for real-time messaging
- **Task:** wf-websocket-gateway
- **Completed:** 2026-02-25
- **Type:** feature
- **Result:** ChatGateway with WsAdapter (Fastify-compatible), manual room management, REST→WS bridge via CreateMessageController, 14 gateway tests + 1 broadcast test

### Install SWC compiler for faster builds
- **Task:** wf-bc6bf0fb
- **Completed:** 2026-02-23
- **Type:** refactor

### Align tsconfig module system with reference
- **Task:** wf-49745460
- **Completed:** 2026-02-23
- **Type:** refactor

### Create Prisma models for chat domain
- **Task:** wf-prisma-models
- **Completed:** 2026-02-23
- **Type:** feature
- **Result:** 3 models (Conversation, Message, Participant) + migration

### Create Participant module with management endpoints
- **Task:** wf-participant-module
- **Completed:** 2026-02-24
- **Type:** feature
- **Result:** 4 controllers, service, 2 DTOs, ConflictException, 17 tests

### Create Message module with CRUD
- **Task:** wf-message-module
- **Completed:** 2026-02-24
- **Type:** feature
- **Result:** 5 controllers, service, 2 DTOs, 15 tests, pagination support

### Create Conversation module with CRUD
- **Task:** wf-conversation-module
- **Completed:** 2026-02-23
- **Type:** feature
- **Result:** 5 controllers, service, 2 DTOs, 15 tests

---

## Dependency Graph

```
[completed] prisma-models
    ├──→ [completed] message-module ──→ [completed] websocket-gateway ──→ [completed] read-receipts
    │                                                                 ──→ [completed] typing-presence
    └──→ [completed] participant-module

[completed] conversation-module (independent, already done)
```

---
Last updated: 2026-02-26
