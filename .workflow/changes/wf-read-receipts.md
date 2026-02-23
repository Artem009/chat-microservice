# [wf-read-receipts] Add read receipts tracking

## Product Context
<!-- PIN: product-context -->
**Product**: chat-microservice-2
**Type**: Backend API microservice

---

## User Story
**As a** developer
**I want** read receipt tracking per participant per conversation
**So that** users can see who has read their messages

## Description
Add a ReadReceipt model (or lastReadMessageId on Participant) to track the last message each participant has read. Provide endpoint to mark messages as read and query unread counts.

## Acceptance Criteria

### Scenario 1: Mark messages as read
**Given** POST /api/message/read
**When** conversationId and lastReadMessageId are provided
**Then** the participant's read position is updated

### Scenario 2: Get unread count
**Given** GET /api/conversation with currentUserId
**When** conversations are returned
**Then** each conversation includes unreadCount for that user

### Scenario 3: Broadcast read receipt via WebSocket
**Given** a participant marks messages as read
**When** the read position is updated
**Then** other participants in the conversation receive a "readReceipt" event

## Dependencies
- wf-conversation-module, wf-message-module, wf-participant-module, wf-websocket-gateway

## Complexity
Medium
