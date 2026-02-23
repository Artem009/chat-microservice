# [wf-prisma-models] Create Prisma models for chat domain

## Product Context
<!-- PIN: product-context -->
**Product**: chat-microservice-2
**Type**: Backend API microservice

---

## User Story
**As a** developer
**I want** Prisma models for Conversation, Message, and Participant
**So that** the database schema supports the chat domain

## Description
Create split Prisma schema files for three core entities following the established pattern (prisma/models/*.prisma). Run merge, generate, and create migration.

## Acceptance Criteria

### Scenario 1: Conversation model
**Given** the prisma/models/ directory
**When** conversation.prisma is created
**Then** it defines a Conversation model with: id (UUID), title (optional), type (enum: DIRECT, GROUP), createdAt, updatedAt, deletedAt
**And** it has relations to Message[] and Participant[]

### Scenario 2: Message model
**Given** the prisma/models/ directory
**When** message.prisma is created
**Then** it defines a Message model with: id (UUID), content (String), conversationId (FK), senderId (String), createdAt, updatedAt, deletedAt
**And** it has a relation to Conversation

### Scenario 3: Participant model
**Given** the prisma/models/ directory
**When** participant.prisma is created
**Then** it defines a Participant model with: id (UUID), conversationId (FK), userId (String), role (enum: ADMIN, MEMBER), joinedAt, leftAt (optional)
**And** it has a unique constraint on [conversationId, userId]
**And** it has a relation to Conversation

### Scenario 4: Migration created
**Given** all three model files exist
**When** prisma:merge and prisma:generate are run
**Then** the merged schema.prisma is valid
**And** a migration is created successfully

## Technical Notes
- Follow split schema pattern: one file per model in prisma/models/
- Use @@map for snake_case table names
- UUID primary keys with @default(uuid())
- Timestamps: createdAt, updatedAt, deletedAt pattern
- Enums: ConversationType (DIRECT, GROUP), ParticipantRole (ADMIN, MEMBER)

## Dependencies
- wf-607119a1 (Prisma setup) — completed

## Complexity
Medium - 3 model files + enums + migration
