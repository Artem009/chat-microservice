# [wf-conversation-module] Create Conversation module with CRUD

## Product Context
<!-- PIN: product-context -->
**Product**: chat-microservice-2
**Type**: Backend API microservice

---

## User Story
**As a** developer
**I want** a Conversation module with full CRUD endpoints
**So that** clients can create, list, get, update, and delete conversations

## Description
Create the conversation/ feature module following reference patterns: one-controller-per-action, BaseController, thin service, DTOs with validation, Swagger docs.

## Acceptance Criteria

### Scenario 1: ConversationService with CRUD methods
**Given** PrismaService is available
**When** ConversationService is created
**Then** it has create(), findAll(), findOne(), update(), remove() methods
**And** each method delegates to PrismaService

### Scenario 2: Create conversation endpoint
**Given** POST /api/conversation
**When** a valid CreateConversationDto is sent (title, type, participantIds)
**Then** a conversation is created with the sender as ADMIN participant
**And** other participantIds are added as MEMBER participants
**And** response follows { data: conversation } envelope

### Scenario 3: List conversations endpoint
**Given** GET /api/conversation
**When** currentUserId query param is provided
**Then** conversations where the user is a participant are returned
**And** response follows { data: conversations[] } envelope

### Scenario 4: Get single conversation
**Given** GET /api/conversation/:id
**When** a valid conversation ID is provided
**Then** the conversation with participants and recent messages is returned
**And** 404 if not found

### Scenario 5: Update conversation
**Given** PATCH /api/conversation/:id
**When** valid UpdateConversationDto is sent
**Then** the conversation title/type is updated

### Scenario 6: Delete conversation (soft delete)
**Given** DELETE /api/conversation/:id
**When** the endpoint is called
**Then** deletedAt is set (soft delete)
**And** response follows { data, message } envelope

## Technical Notes
- Module structure: conversation/conversation.module.ts, conversation.service.ts, controllers/, dto/
- Controllers: create-conversation.controller.ts, list-conversation.controller.ts, get-conversation.controller.ts, update-conversation.controller.ts, delete-conversation.controller.ts
- BaseController pattern with protected readonly dependencies
- DTOs: create-conversation.dto.ts, update-conversation.dto.ts
- Register in AppModule imports

## Dependencies
- wf-prisma-models (Prisma models must exist first)

## Complexity
High - Full module with 5 controllers, service, DTOs, tests
