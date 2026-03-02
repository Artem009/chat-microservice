# wf-caf5fe8e: Missing conversation validation in AddParticipantController causes P2025

**Created**: 2026-03-02
**Status**: Fixed
**Severity**: Medium
**Priority**: P2
**Tags**: #bug #module:participant #prisma #validation

## Bug Summary

POST `/api/participant` throws unhandled `PrismaClientKnownRequestError P2025` (500 Internal Server Error) when called with a `conversationId` that doesn't exist in the database. The controller uses `{ connect: { id: dto.conversationId } }` without first verifying the conversation exists, resulting in a raw Prisma error instead of a proper 404 response.

## Reproduction

### Steps to Reproduce
1. Ensure there is NO conversation with ID `955a438b-8057-46bc-9b84-58a36aaf44e6` in the database
2. Send POST request:
   ```bash
   curl -X 'POST' \
     'http://localhost:3000/api/participant' \
     -H 'Content-Type: application/json' \
     -d '{
       "conversationId": "955a438b-8057-46bc-9b84-58a36aaf44e6",
       "userId": "550e8400-e29b-41d4-a716-446655440009",
       "role": "MEMBER"
     }'
   ```
3. Observe 500 error response with raw Prisma stack trace

### Expected Behavior
API should return HTTP 404 with a structured error response:
```json
{
  "message": "Conversation not found",
  "error": "not_found_exception",
  "createdAt": "..."
}
```

### Actual Behavior
API returns HTTP 500 with unhandled `PrismaClientKnownRequestError`:
```
PrismaClientKnownRequestError:
Invalid `this.prisma.participant.create()` invocation
An operation failed because it depends on one or more records that were required but not found.
No 'Conversation' record was found for nested connect on 'ConversationToParticipant'.
Code: P2025
```

### Environment
- OS: Linux 6.17.0-14-generic
- Node/Runtime: NestJS 11 + Prisma 6.19.2
- Database: PostgreSQL 17 (via Prisma)

### Screenshots/Logs
Full stack trace originates at `add-participant.controller.ts:35`

---

## Root Cause Analysis

### What Went Wrong?
In `src/participant/controllers/add-participant.controller.ts:35-39`, the controller calls `this.participantService.create()` with `conversation: { connect: { id: dto.conversationId } }` without verifying the conversation exists first. When the conversation record is missing, Prisma throws P2025 which propagates as an unhandled 500 error.

The service layer (`participant.service.ts:10`) is intentionally thin — it directly returns `this.prisma.participant.create({ data })` with no validation. This is by design (per decisions.md: "Services are thin wrappers around Prisma client calls"), so validation belongs in the controller.

### Why Did This Happen?
- [x] Missing edge case handling
- [x] Incorrect assumption about inputs/state

### Source of the Problem
- **Prompt issue**: Original participant module creation assumed valid conversationId would always be passed
- **Logic gap**: Other controllers (CreateMessageController, CreateReactionController, MarkReadController) validate FK references before create, but AddParticipantController was missed
- **Missing context**: The pattern of pre-validating FK references wasn't codified as a mandatory rule in decisions.md

---

## Fix Approaches

### Approach 1: Pre-validation with ConversationService (Recommended)
**Description**: Inject ConversationService into BaseController (or AddParticipantController directly) and call `conversationService.findOne(dto.conversationId)` before creating the participant. Throw `NotFoundException` if conversation doesn't exist or is soft-deleted.
**Pros**: Explicit, follows existing pattern (CreateMessageController validates parentMessage, CreateReactionController validates message, GetConversationController validates conversation), clear error message
**Cons**: Extra DB query (SELECT before INSERT) — negligible for a write operation
**Files affected**:
- `src/participant/controllers/add-participant.controller.ts`
- `src/participant/controllers/base.controller.ts` (add ConversationService)
- `src/participant/participant.module.ts` (import ConversationModule)

### Approach 2: Try-catch P2025 in controller
**Description**: Wrap `participantService.create()` in try-catch, catch P2025 specifically, throw NotFoundException.
**Pros**: No extra DB query
**Cons**: Reactive rather than proactive, less readable, can't distinguish "deleted" vs "never existed"
**Files affected**:
- `src/participant/controllers/add-participant.controller.ts`

### Chosen Approach
**Approach 1: Pre-validation** — aligns with established project patterns. Pre-validation is the convention in this codebase (see CreateMessageController:29-32, CreateReactionController:24-27, GetConversationController:17-20).

---

## Acceptance Criteria

### Scenario 1: Bug is fixed — non-existent conversation returns 404
**Given** no conversation exists with the provided conversationId
**When** POST `/api/participant` is called with that conversationId
**Then** API returns HTTP 404 with `{ "message": "Conversation not found", "error": "not_found_exception" }`

### Scenario 2: No regression — valid participant creation still works
**Given** a conversation exists with the provided conversationId
**When** POST `/api/participant` is called with a valid userId and role
**Then** participant is created and returned with HTTP 201

### Scenario 3: No regression — duplicate participant still returns conflict
**Given** a participant already exists for the given conversationId + userId
**When** POST `/api/participant` is called with the same conversationId and userId
**Then** API returns HTTP 409 Conflict (existing behavior preserved)

### Scenario 4: Edge case — deleted conversation returns 404
**Given** a conversation exists but has `deletedAt` set (soft-deleted)
**When** POST `/api/participant` is called with that conversationId
**Then** API returns HTTP 404 with `{ "message": "Conversation not found", "error": "not_found_exception" }`

---

## Test Strategy
- [x] Unit test: POST `/api/participant` with non-existent conversationId -> expect NotFoundException
- [x] Unit test: POST `/api/participant` with soft-deleted conversationId -> expect NotFoundException
- [ ] Manual verification: reproduce original curl command -> confirm 404 instead of 500

## Verification Checklist
1. [ ] `curl` with non-existent conversationId returns 404 (not 500)
2. [ ] Existing unit tests pass without modification
3. [ ] TypeCheck passes
4. [ ] Lint passes

---

## Prevention & Learning

### How to Prevent Similar Bugs
1. Add a rule to `decisions.md`: "All controllers using Prisma `connect` MUST validate the referenced record exists before calling create/update"
2. Review other controllers for same pattern gap

### Learnings to Capture
- [ ] Pattern to add to decisions.md: "FK Validation Rule - before ANY Prisma create/update with `{ connect: { id } }`, verify the target record exists via service.findOne() and throw NotFoundException if missing"
- [ ] Feedback pattern: "Missing FK validation on Prisma connect - count: 1"

---

## Related
- wf-participant-module: Create Participant module with management endpoints
- Pattern: CreateReactionController validates message (src/reaction/controllers/create-reaction.controller.ts:24-27)
- Pattern: GetConversationController validates conversation (src/conversation/controllers/get-conversation.controller.ts:17-20)


## Resolution
- **Fixed in**: next commit (feat: fix wf-caf5fe8e)
- **Root cause confirmed**: yes - AddParticipantController missing conversation existence check before Prisma connect
- **Learnings applied**: Added missing-fk-validation pattern to feedback-patterns.md (count: 1)
- **Tests added**: 2 new unit tests (conversation not found, conversation soft-deleted) in participant.spec.ts
