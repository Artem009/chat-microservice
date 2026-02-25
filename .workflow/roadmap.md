# Project Roadmap

<!-- PINS: now, next, later, ideas, completed -->

## Now (Current Focus)
<!-- PIN: now -->

_No active tasks. All data-layer modules complete._

---

## Next (Ready to Plan)
<!-- PIN: next -->

_No tasks in Next. Read receipts and typing indicators are ready to plan._

---

## Later (Future Phases)
<!-- PIN: later -->

### Add read receipts tracking
- **Task:** wf-read-receipts
- **Priority:** P2
- **Feature:** ft-advanced
- **Tags:** #domain #read-receipts
- **Depends On:** wf-websocket-gateway
- **Assumes:**
  - WebSocket gateway is operational for real-time delivery
  - May require new Prisma model (ReadReceipt)

### Add typing indicators and online presence
- **Task:** wf-typing-presence
- **Priority:** P2
- **Feature:** ft-advanced
- **Tags:** #domain #typing #presence
- **Depends On:** wf-websocket-gateway
- **Assumes:**
  - WebSocket gateway supports broadcast events
  - Presence may need Redis or in-memory store for ephemeral state

---

## Ideas (Exploration)
<!-- PIN: ideas -->

_No items yet._

---

## Completed
<!-- PIN: completed -->

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
    ├──→ [completed] message-module ──→ [completed] websocket-gateway ──→ [unblocked] read-receipts
    │                                                                 ──→ [unblocked] typing-presence
    └──→ [completed] participant-module

[completed] conversation-module (independent, already done)
```

---
Last updated: 2026-02-25
