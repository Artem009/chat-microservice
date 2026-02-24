# Project Roadmap

<!-- PINS: now, next, later, ideas, completed -->

## Now (Current Focus)
<!-- PIN: now -->

### Create Message module with CRUD
- **Task:** wf-message-module
- **Priority:** P1
- **Feature:** ft-data-layer
- **Tags:** #domain #message #crud
- **Depends On:** wf-prisma-models (completed)
- **Key Files:**
  - prisma/models/message.prisma — Message model definition
  - src/conversation/ — Reference implementation pattern

### Create Participant module with management endpoints
- **Task:** wf-participant-module
- **Priority:** P1
- **Feature:** ft-data-layer
- **Tags:** #domain #participant #crud
- **Depends On:** wf-prisma-models (completed)
- **Key Files:**
  - prisma/models/participant.prisma — Participant model definition
  - src/conversation/ — Reference implementation pattern

> These two tasks can run **in parallel** (no dependencies between them).

---

## Next (Ready to Plan)
<!-- PIN: next -->

### Create WebSocket gateway for real-time messaging
- **Task:** wf-websocket-gateway
- **Priority:** P2
- **Feature:** ft-realtime
- **Tags:** #domain #websocket #realtime
- **Depends On:** wf-message-module
- **Assumes:**
  - Message module provides CRUD operations for WebSocket to emit events
  - NestJS @WebSocketGateway decorator with Fastify adapter compatibility
- **Key Files:**
  - src/message/ — Message service for persistence
  - src/app.module.ts — Will need to import WebSocket module

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

### Create Conversation module with CRUD
- **Task:** wf-conversation-module
- **Completed:** 2026-02-23
- **Type:** feature
- **Result:** 5 controllers, service, 2 DTOs, 15 tests

---

## Dependency Graph

```
[completed] prisma-models
    ├──→ [ready] message-module ──→ [blocked] websocket-gateway ──→ [blocked] read-receipts
    │                                                            ──→ [blocked] typing-presence
    └──→ [ready] participant-module (independent)

[completed] conversation-module (independent, already done)
```

---
Last updated: 2026-02-24
