# Function Map

Utility functions available for reuse. **Check before creating new utilities.**

<!-- PINS: utilities, prisma-helpers, decorators, exceptions -->

## Reference Patterns (from comment-microservice)

| Function | Purpose | Ref Path | Parameters |
|----------|---------|----------|------------|
| LocalApiProperty | Conditionally show API field in Swagger (LOCAL mode only) | ref:src/common/decorators/local-api-property.decorator.ts | (options: ApiPropertyOptions) |
| checkCommentExist | Verify entity exists, throw NotFoundException if not | ref:src/comment/comment.manager.ts | (id: string) |
| addMentions | Batch upsert mentions for an entity | ref:src/comment/comment.manager.ts | (mentions: MentionAddDto[], entityId, entityType) |
| findReactions | Find reactions using aggregated count data | ref:src/comment/comment.manager.ts | (params: FindReactionsType) |
| updateReactionsCount | Enrich reaction counts with current user's reactions | ref:src/comment/comment.manager.ts | (params: UpdateReactionsCountType) |
| addAdditionalCommentData | Combine reactions + mentions for a comment response | ref:src/comment/comment.manager.ts | (comment, reactionsLimit, currentUser) |

## Utilities

| Function | Purpose | File | Parameters |
|----------|---------|------|------------|
<!-- Functions will be registered as they're created -->

## Rules

1. **Before creating** -> Search this file
2. **If similar exists** -> Extend it, don't create new
3. **After creating** -> Update this file
