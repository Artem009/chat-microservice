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

| Method | Endpoint | Service | File |
|--------|----------|---------|------|
<!-- Endpoints will be registered as they're created -->

## Client Functions

| Function | Method | Endpoint | File |
|----------|--------|----------|------|
<!-- Client functions will be registered as they're created -->

## Rules

1. **Before creating** -> Search this file
2. **If similar exists** -> Parameterize it, don't duplicate
3. **After creating** -> Update this file
