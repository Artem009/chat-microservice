# Schema Map

Prisma models and database schema. **Check before creating new models.**

<!-- PINS: models, enums, relations -->

## Models
<!-- PIN: models -->

| Model | Table | PK | Soft Delete | File |
|-------|-------|----|-------------|------|
| Conversation | conversations | UUID | deletedAt | prisma/models/conversation.prisma |
| Message | messages | UUID | deletedAt | prisma/models/message.prisma |
| Participant | participants | UUID | leftAt | prisma/models/participant.prisma |

## Enums
<!-- PIN: enums -->

| Enum | Values | Used By |
|------|--------|---------|
| ConversationType | DIRECT, GROUP | Conversation.type (default: GROUP) |
| ParticipantRole | ADMIN, MEMBER | Participant.role (default: MEMBER) |

## Relations
<!-- PIN: relations -->

| From | To | Type | On Delete |
|------|----|------|-----------|
| Message | Conversation | Many-to-One | Cascade |
| Participant | Conversation | Many-to-One | Cascade |

## Indexes

| Model | Fields | Type |
|-------|--------|------|
| Message | conversationId | Index |
| Message | senderId | Index |
| Participant | userId | Index |
| Participant | conversationId + userId | Unique |

## Schema Management

- **Base schema**: `prisma/base.prisma` (generator + datasource)
- **Model files**: `prisma/models/*.prisma` (one per model)
- **Merge**: `prisma/merge.ts` → `prisma/schema.prisma`
- **Command**: `npm run prisma:short-cut:create`

## Rules

1. **Before creating** -> Search this file
2. **One model per file** in `prisma/models/`
3. **After creating** -> Run merge, update this file
