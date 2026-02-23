# Plan: Chat Domain Business Logic

## Goal
<!-- PIN: goal -->
Implement the core chat domain: conversations, messages, and participants with real-time delivery via WebSockets.

## Description
<!-- PIN: description -->
Build the business logic layer for the chat microservice. The infrastructure (Fastify, Prisma, Swagger, validation, exceptions) is complete from pl-693271de. This plan adds domain entities, CRUD endpoints, and real-time communication following the established reference architecture patterns (feature-based modules, one-controller-per-action, thin services, manager orchestration).

## Success Criteria
<!-- PIN: success-criteria -->
- [ ] Conversation CRUD endpoints functional with Swagger docs
- [ ] Message CRUD endpoints with conversation scoping
- [ ] Participant management (add/remove/roles) endpoints
- [ ] Prisma models with migrations applied
- [ ] WebSocket gateway for real-time message delivery
- [ ] Typing indicators and online presence via WebSocket
- [ ] Read receipts tracked per participant per conversation
- [ ] All endpoints covered by unit tests
- [ ] E2E tests for critical flows

## Items
<!-- PIN: items -->

### Features
- ft-data-layer    <!-- Phase 1: Data Layer — Prisma models + CRUD -->
- ft-realtime      <!-- Phase 2: Real-time — WebSocket gateway -->
- ft-advanced      <!-- Phase 3: Advanced — Read receipts, typing, roles -->

## Timeline
<!-- PIN: timeline -->
| Phase | Description | Features |
|-------|-------------|----------|
| Phase 1 | Data Layer: Prisma models + CRUD endpoints | ft-data-layer |
| Phase 2 | Real-time: WebSocket gateway + live delivery | ft-realtime |
| Phase 3 | Advanced: Read receipts, typing indicators, roles | ft-advanced |

## Status: ready
## Progress: 0%
## Created: 2026-02-23T18:00:00.000Z
## Updated: 2026-02-23T18:00:00.000Z
