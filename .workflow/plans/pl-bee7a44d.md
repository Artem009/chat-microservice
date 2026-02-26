# Plan: Chat Domain v2 — Advanced Features & Quality

## Goal
<!-- PIN: goal -->
Extend the chat microservice with E2E test coverage and advanced messaging features: reactions, mentions, and threads.

## Description
<!-- PIN: description -->
Building on the completed Chat Domain v1 (conversations, messages, participants, WebSocket gateway, read receipts, typing indicators), this plan adds quality assurance via integration tests and three new domain features that enrich the messaging experience. Each feature follows the established patterns: Prisma model + REST endpoints + WebSocket broadcast + unit tests.

## Success Criteria
<!-- PIN: success-criteria -->
- [ ] E2E tests covering all API endpoints and WebSocket events
- [ ] Reaction model with REST CRUD and WebSocket broadcast
- [ ] Mention parsing in messages with notification via WebSocket
- [ ] Thread support via parentMessageId with thread-specific endpoints
- [ ] All new features covered by unit tests
- [ ] All existing 96+ tests continue to pass

## Items
<!-- PIN: items -->

### Features
- ft-quality      <!-- Integration Tests (E2E) -->
- ft-reactions    <!-- Reactions (Likes / Reactions) -->
- ft-mentions     <!-- Mentions (@mentions) -->
- ft-threads      <!-- Threads (Nested Conversations) -->

## Timeline
<!-- PIN: timeline -->
| Phase | Description | Features |
|-------|-------------|----------|
| Phase 1 | Quality: E2E tests for existing features | ft-quality |
| Phase 2 | Reactions: Emoji reactions on messages | ft-reactions |
| Phase 3 | Mentions: @user parsing and notifications | ft-mentions |
| Phase 4 | Threads: Nested reply conversations | ft-threads |

## Status: ready
## Progress: 0%
## Created: 2026-02-26T10:33:33.799Z
## Updated: 2026-02-26T10:33:33.799Z
