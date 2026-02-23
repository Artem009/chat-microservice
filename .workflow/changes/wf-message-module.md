# [wf-message-module] Create Message module with CRUD

## Product Context
<!-- PIN: product-context -->
**Product**: chat-microservice-2
**Type**: Backend API microservice

---

## User Story
**As a** developer
**I want** a Message module with CRUD endpoints scoped to conversations
**So that** clients can send, list, get, update, and delete messages within a conversation

## Description
Create the message/ feature module following reference patterns. Messages are always scoped to a conversation (conversationId in route or body).

## Acceptance Criteria

### Scenario 1: MessageService with CRUD methods
**Given** PrismaService is available
**When** MessageService is created
**Then** it has create(), findByConversation(), findOne(), update(), remove() methods

### Scenario 2: Send message endpoint
**Given** POST /api/message
**When** a valid CreateMessageDto is sent (content, conversationId, senderId)
**Then** a message is created in the conversation
**And** response follows { data: message } envelope

### Scenario 3: List messages by conversation
**Given** GET /api/message?conversationId=xxx
**When** a valid conversationId query param is provided
**Then** messages for that conversation are returned ordered by createdAt DESC
**And** supports pagination (take, skip)

### Scenario 4: Get single message
**Given** GET /api/message/:id
**When** a valid message ID is provided
**Then** the message with sender info is returned

### Scenario 5: Update message
**Given** PATCH /api/message/:id
**When** valid UpdateMessageDto is sent (content)
**Then** the message content is updated

### Scenario 6: Delete message (soft delete)
**Given** DELETE /api/message/:id
**When** the endpoint is called
**Then** deletedAt is set (soft delete)

## Technical Notes
- Module structure: message/message.module.ts, message.service.ts, controllers/, dto/
- Controllers: create-message.controller.ts, list-message.controller.ts, get-message.controller.ts, update-message.controller.ts, delete-message.controller.ts
- BaseController pattern
- DTOs: create-message.dto.ts, update-message.dto.ts
- Pagination support: take/skip query params

## Dependencies
- wf-prisma-models (Prisma models must exist first)

## Complexity
High - Full module with 5 controllers, service, DTOs, tests
