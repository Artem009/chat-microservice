# API Map

API endpoints and client functions. **Check before creating new endpoints.**

<!-- PINS: endpoints, reference-patterns -->

## Reference Patterns (from comment-microservice)

| Method | Endpoint | Purpose | Ref Path |
|--------|----------|---------|----------|
| POST | /api/comment | Create comment with mentions | ref:src/comment/controllers/create-comment.controller.ts |
| GET | /api/comment | List comments with reactions & mentions | ref:src/comment/controllers/list-comments.controller.ts |
| GET | /api/comment/:id | Get single comment with relations | ref:src/comment/controllers/get-comment.controller.ts |
| PATCH | /api/comment/:id | Update comment text, mentions | ref:src/comment/controllers/update-comment.controller.ts |
| DELETE | /api/comment/:id | Delete comment (blocks if has children) | ref:src/comment/controllers/delete-comment.controller.ts |
| POST | /api/reaction | Create reaction on comment | ref:src/reaction/reaction.controller.ts |
| DELETE | /api/reaction | Remove reaction from comment | ref:src/reaction/reaction.controller.ts |

## Endpoints

| Method | Endpoint | Controller | Service | File |
|--------|----------|------------|---------|------|
| GET | / | AppController | AppService | src/app.controller.ts |
| POST | /api/conversation | CreateConversationController | ConversationService | src/conversation/controllers/create-conversation.controller.ts |
| GET | /api/conversation | ListConversationController | ConversationService | src/conversation/controllers/list-conversation.controller.ts |
| GET | /api/conversation/:id | GetConversationController | ConversationService | src/conversation/controllers/get-conversation.controller.ts |
| PATCH | /api/conversation/:id | UpdateConversationController | ConversationService | src/conversation/controllers/update-conversation.controller.ts |
| DELETE | /api/conversation/:id | DeleteConversationController | ConversationService | src/conversation/controllers/delete-conversation.controller.ts |
| POST | /api/message | CreateMessageController | MessageService | src/message/controllers/create-message.controller.ts |
| GET | /api/message?conversationId&take&skip | ListMessageController | MessageService | src/message/controllers/list-message.controller.ts |
| GET | /api/message/:id | GetMessageController | MessageService | src/message/controllers/get-message.controller.ts |
| PATCH | /api/message/:id | UpdateMessageController | MessageService | src/message/controllers/update-message.controller.ts |
| DELETE | /api/message/:id | DeleteMessageController | MessageService | src/message/controllers/delete-message.controller.ts |
| POST | /api/participant | AddParticipantController | ParticipantService | src/participant/controllers/add-participant.controller.ts |
| GET | /api/participant?conversationId | ListParticipantController | ParticipantService | src/participant/controllers/list-participant.controller.ts |
| PATCH | /api/participant/:id | UpdateParticipantController | ParticipantService | src/participant/controllers/update-participant.controller.ts |
| DELETE | /api/participant/:id | RemoveParticipantController | ParticipantService | src/participant/controllers/remove-participant.controller.ts |
| POST | /api/message/read | MarkReadController | ParticipantService | src/message/controllers/mark-read.controller.ts |
| GET | /api/message/thread/:parentMessageId | ListThreadController | MessageService | src/message/controllers/list-thread.controller.ts |
| POST | /api/reaction | CreateReactionController | ReactionService | src/reaction/controllers/create-reaction.controller.ts |
| GET | /api/reaction?messageId | ListReactionController | ReactionService | src/reaction/controllers/list-reaction.controller.ts |
| DELETE | /api/reaction/:id | DeleteReactionController | ReactionService | src/reaction/controllers/delete-reaction.controller.ts |
| GET | /api/mention?messageId&userId | ListMentionController | MentionService | src/mention/controllers/list-mention.controller.ts |

**Auth:** All `/api/conversation`, `/api/message`, `/api/participant`, `/api/reaction`, and `/api/mention` endpoints require `authorization` header.
**Response format:** `{ data: ... }` envelope. DELETE also includes `message`.
**Special:** POST /api/participant returns 409 ConflictException for duplicate active participants; supports rejoin for left participants.
**Special:** POST /api/reaction returns 409 ConflictException for duplicate reactions (same user+message+emoji). Broadcasts `reactionAdded`/`reactionRemoved` via WebSocket.
**Special:** POST /api/message auto-parses @mentions from content, creates Mention records, broadcasts `userMentioned` via WebSocket. Supports `parentMessageId` for thread replies (broadcasts `threadReply`).

## Client Functions

| Function | Method | Endpoint | File |
|----------|--------|----------|------|
<!-- Client functions will be registered as they're created -->

## Rules

1. **Before creating** -> Search this file
2. **If similar exists** -> Parameterize it, don't duplicate
3. **After creating** -> Update this file
