# [wf-typing-presence] Add typing indicators and online presence

## Product Context
<!-- PIN: product-context -->
**Product**: chat-microservice-2
**Type**: Backend API microservice

---

## User Story
**As a** developer
**I want** typing indicators and presence tracking
**So that** users see who is online and who is currently typing

## Description
Extend the WebSocket gateway with typing indicator events and presence tracking (online/offline/away).

## Acceptance Criteria

### Scenario 1: Typing indicator
**Given** a client emits "typing" with conversationId
**When** the gateway receives the event
**Then** it broadcasts "userTyping" to other participants in the room

### Scenario 2: Stop typing
**Given** a client emits "stopTyping" with conversationId
**When** the gateway receives the event
**Then** it broadcasts "userStoppedTyping" to other participants

### Scenario 3: Online presence
**Given** a client connects via WebSocket
**When** they authenticate with userId
**Then** their status is set to "online"
**And** other connected users receive a "presenceUpdate" event

### Scenario 4: Offline detection
**Given** a client disconnects
**When** the WebSocket connection closes
**Then** their status is set to "offline"
**And** other users receive a "presenceUpdate" event

## Dependencies
- wf-websocket-gateway

## Complexity
Medium
