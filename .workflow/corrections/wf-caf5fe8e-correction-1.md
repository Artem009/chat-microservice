# Correction Report: wf-caf5fe8e-Correction-1

**Task**: wf-caf5fe8e — Missing conversation validation in AddParticipantController causes P2025
**Date**: 2026-03-02
**Severity**: Medium
**Discovery**: Manual API testing (curl)

---

## Problem Description

### What Was Expected
When POST `/api/participant` is called with a non-existent `conversationId`, the API should return HTTP 404 with a structured error response:
```json
{
  "message": "Conversation not found",
  "error": "not_found_exception",
  "createdAt": "..."
}
```

### What Actually Happened
The API returned HTTP 500 with an unhandled `PrismaClientKnownRequestError` (P2025) and a raw Prisma stack trace leaked to the client:
```
PrismaClientKnownRequestError:
An operation failed because it depends on one or more records that were required but not found.
No 'Conversation' record was found for nested connect on 'ConversationToParticipant'.
```

### Error Message
```
[Nest] ERROR [ExceptionsHandler] PrismaClientKnownRequestError:
Invalid `this.prisma.participant.create()` invocation in
src/participant/participant.service.ts:10:36
Code: P2025
```

### Reproduction
```bash
curl -X 'POST' 'http://localhost:3000/api/participant' \
  -H 'Content-Type: application/json' \
  -d '{
    "conversationId": "955a438b-8057-46bc-9b84-58a36aaf44e6",
    "userId": "550e8400-e29b-41d4-a716-446655440009",
    "role": "MEMBER"
  }'
```

---

## Root Cause Analysis

### Technical Root Cause
`AddParticipantController.add()` (line 35-39) called `participantService.create()` with `conversation: { connect: { id: dto.conversationId } }` **without validating** that the conversation record exists in the database first. Prisma's `connect` operation throws P2025 when the referenced record is missing.

### Why This Happened
1. **Pattern inconsistency**: Other controllers in the project (CreateMessageController, CreateReactionController, MarkReadController) all validate foreign key references before calling Prisma create/update. AddParticipantController was the only one that skipped this step.
2. **Missing codified rule**: The FK validation pattern was an implicit convention but was never explicitly documented in `decisions.md`, so it wasn't enforced during the original participant module creation.
3. **Service layer is intentionally thin**: Per project architecture, services are thin Prisma wrappers. This is correct, but it means the controller MUST handle all validation — there's no safety net at the service layer.

### AI Contribution to Bug
The original participant module was created by AI (wf-participant-module). The AI correctly implemented duplicate-participant detection (`findByConversationAndUser`) but missed the conversation existence check. This suggests the original prompt/spec didn't explicitly require FK validation, and the AI didn't infer it from the codebase patterns.

---

## Solution Applied

| File | Change |
|------|--------|
| `src/participant/controllers/base.controller.ts` | Added `ConversationService` as second constructor parameter |
| `src/participant/controllers/add-participant.controller.ts` | Added `conversationService.findOne()` check before create; throw `NotFoundException` if null or soft-deleted |
| `src/participant/controllers/list-participant.controller.ts` | Updated constructor to pass `ConversationService` to super |
| `src/participant/controllers/update-participant.controller.ts` | Updated constructor to pass `ConversationService` to super |
| `src/participant/controllers/remove-participant.controller.ts` | Updated constructor to pass `ConversationService` to super |
| `src/participant/participant.module.ts` | Added `ConversationModule` to imports |
| `src/participant/participant.spec.ts` | Added `ConversationService` mock + 2 new test cases |

### Key Code Change
```typescript
// BEFORE (add-participant.controller.ts:35-39)
const participant = await this.participantService.create({
  userId: dto.userId,
  role: dto.role ?? 'MEMBER',
  conversation: { connect: { id: dto.conversationId } },
});

// AFTER (add-participant.controller.ts:21-27 + 35-39)
const conversation = await this.conversationService.findOne(dto.conversationId);
if (!conversation || conversation.deletedAt) {
  throw new NotFoundException('Conversation not found');
}
// ... then proceed with create
```

---

## Prevention Measures

### Immediate Actions Taken
1. Added `missing-fk-validation` pattern to `feedback-patterns.md` (count: 1)
2. Added 2 unit tests specifically for conversation validation (not found + soft-deleted)

### Recommended Future Actions
1. **Add explicit rule to decisions.md**: "All controllers using Prisma `{ connect: { id } }` MUST validate the referenced record exists via `service.findOne()` and throw `NotFoundException` if missing or soft-deleted"
2. **Audit other controllers**: Check any other controller that uses `connect` without pre-validation
3. **Spec template improvement**: Add "FK Validation" as a standard acceptance criterion checkbox for any story that involves creating/updating records with foreign key references

### Pattern for Future Reference
When creating a record with a foreign key reference in this codebase:
```typescript
// 1. Validate referenced record exists
const referenced = await this.referencedService.findOne(dto.referencedId);
if (!referenced || referenced.deletedAt) {
  throw new NotFoundException('Referenced entity not found');
}

// 2. Then create the record
const result = await this.service.create({
  ...fields,
  referenced: { connect: { id: dto.referencedId } },
});
```

---

## Metrics

| Metric | Value |
|--------|-------|
| Time to discover | Found during manual testing |
| Time to fix | ~10 minutes |
| Files changed | 7 |
| Tests added | 2 |
| Tests total (passing) | 141/141 |
| Commit | 76ddc9d |
