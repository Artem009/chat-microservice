# [wf-websocket-gateway] Create WebSocket gateway for real-time messaging

## Product Context
<!-- PIN: product-context -->
**Product**: chat-microservice-2
**Type**: Backend API microservice

---

## User Story
**As a** developer
**I want** a WebSocket gateway using @nestjs/websockets
**So that** clients receive messages in real-time without polling

## Description
Install @nestjs/websockets and @nestjs/platform-socket.io (or Fastify WebSocket adapter). Create a ChatGateway that handles: connection/disconnection, joining conversation rooms, broadcasting new messages.

## Acceptance Criteria

### Scenario 1: WebSocket gateway setup
**Given** @nestjs/websockets is installed
**When** ChatGateway is created
**Then** it decorates with @WebSocketGateway()
**And** it handles connection/disconnection lifecycle

### Scenario 2: Join conversation room
**Given** a client connects via WebSocket
**When** they emit "joinConversation" with conversationId
**Then** the client socket joins the conversation room

### Scenario 3: Broadcast new messages
**Given** a message is created via REST API (POST /api/message)
**When** the message is saved
**Then** ChatGateway broadcasts the message to all sockets in that conversation room

### Scenario 4: Leave conversation room
**Given** a client is in a conversation room
**When** they emit "leaveConversation"
**Then** the client socket leaves the room

## Technical Notes
- Install: @nestjs/websockets, @nestjs/platform-socket.io (or ws adapter for Fastify)
- ChatGateway in chat-gateway/ module
- EventEmitter2 or direct service injection for REST→WS bridge
- Consider Fastify WebSocket adapter compatibility

## Dependencies
- wf-message-module (message creation triggers broadcast)

## Complexity
High - New technology layer (WebSockets) + integration with REST
