# [wf-participant-module] Create Participant module with management endpoints

## User Story
**As a** developer
**I want** a Participant module for managing conversation membership
**So that** clients can add/remove participants and manage roles

## Acceptance Criteria

### Scenario 1: ParticipantService with CRUD methods
**Given** PrismaService is available
**When** ParticipantService is created
**Then** it has add(), remove(), findByConversation(), findOne(), updateRole() methods

### Scenario 2: Add participant endpoint (with duplicate/rejoin logic)
**Given** POST /api/participant
**When** a valid AddParticipantDto is sent (conversationId, userId, role?)
**Then** user is added to conversation with specified role (default: MEMBER)
**And** if user already active in conversation → throw ConflictException (409)
**And** if user previously left (leftAt set) → rejoin (set leftAt=null, update role)
**And** response follows { data: participant } envelope

### Scenario 3: List participants by conversation
**Given** GET /api/participant?conversationId=xxx
**When** a valid conversationId query param is provided
**Then** active participants (leftAt IS NULL) are returned ordered by joinedAt ASC

### Scenario 4: Update participant role
**Given** PATCH /api/participant/:id
**When** valid UpdateParticipantDto is sent (role)
**Then** participant role is updated
**And** throws NotFoundException if participant not found or has left

### Scenario 5: Remove participant (soft)
**Given** DELETE /api/participant/:id
**When** the endpoint is called
**Then** leftAt is set to current timestamp
**And** throws NotFoundException if participant not found or already left
**And** response follows { data: participant, message: 'Participant removed' }

### Scenario 6: ConflictException class
**Given** no ConflictException exists in src/exeption/
**When** module needs 409 responses
**Then** create ConflictException following existing BadRequestException pattern

### Scenario 7: Unit tests
**Given** ParticipantModule is compiled
**When** tests run
**Then** service methods, all controllers, and error cases are covered

## Technical Notes
- Files to create:
  - src/exeption/conflict.exception.ts + update index.ts barrel
  - src/participant/participant.module.ts
  - src/participant/participant.service.ts
  - src/participant/controllers/base.controller.ts
  - src/participant/controllers/add-participant.controller.ts
  - src/participant/controllers/list-participant.controller.ts
  - src/participant/controllers/update-participant.controller.ts
  - src/participant/controllers/remove-participant.controller.ts
  - src/participant/dto/add-participant.dto.ts
  - src/participant/dto/update-participant.dto.ts
  - src/participant/participant.spec.ts
- Wire ParticipantModule into AppModule
- Participant uses leftAt (not deletedAt) for soft-remove
- Unique constraint [conversationId, userId] handles duplicates at DB level

## Boundaries
- Do NOT modify conversation or message modules
- Do NOT modify Prisma schema (already exists)

## Verification Commands
- npx tsc --noEmit
- npx eslint src/participant/ src/exeption/
- npx jest --testPathPatterns=participant
