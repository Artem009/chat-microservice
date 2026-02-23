# [wf-participant-module] Create Participant module with management endpoints

## Product Context
<!-- PIN: product-context -->
**Product**: chat-microservice-2
**Type**: Backend API microservice

---

## User Story
**As a** developer
**I want** a Participant module for managing conversation membership
**So that** clients can add/remove participants and manage roles

## Description
Create the participant/ feature module. Participants link users to conversations with roles (ADMIN, MEMBER).

## Acceptance Criteria

### Scenario 1: ParticipantService
**Given** PrismaService is available
**When** ParticipantService is created
**Then** it has add(), remove(), findByConversation(), updateRole() methods

### Scenario 2: Add participant endpoint
**Given** POST /api/participant
**When** a valid AddParticipantDto is sent (conversationId, userId, role?)
**Then** the user is added to the conversation with the specified role (default: MEMBER)
**And** duplicate check: 409 if user already in conversation

### Scenario 3: List participants by conversation
**Given** GET /api/participant?conversationId=xxx
**When** a valid conversationId is provided
**Then** all active participants (leftAt IS NULL) are returned

### Scenario 4: Update participant role
**Given** PATCH /api/participant/:id
**When** valid UpdateParticipantDto is sent (role)
**Then** the participant role is updated

### Scenario 5: Remove participant (soft)
**Given** DELETE /api/participant/:id
**When** the endpoint is called
**Then** leftAt is set to current timestamp (soft remove)

## Technical Notes
- Module structure: participant/participant.module.ts, participant.service.ts, controllers/, dto/
- Controllers: add-participant.controller.ts, list-participant.controller.ts, update-participant.controller.ts, remove-participant.controller.ts
- DTOs: add-participant.dto.ts, update-participant.dto.ts
- Unique constraint on [conversationId, userId] prevents duplicates

## Dependencies
- wf-prisma-models (Prisma models must exist first)

## Complexity
Medium - 4 controllers, service, DTOs, tests
