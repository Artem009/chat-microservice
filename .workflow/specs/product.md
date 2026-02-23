# Product: chat-microservice-2

<!-- PINS: overview, users, features, non-goals, architecture -->

## Overview
<!-- PIN: overview -->

**Name**: chat-microservice-2
**Type**: Backend API microservice
**Tagline**: A chat/messaging microservice for real-time conversations

Chat-microservice-2 is a backend API service that provides chat and messaging functionality. It follows the same architectural patterns as the comment-microservice, adapted for real-time chat conversations with support for reactions and mentions.

## Target Users
<!-- PIN: users -->

- Frontend applications needing chat/messaging backend
- Other microservices in the ecosystem requiring messaging capabilities
- API consumers via Swagger documentation

## Key Features
<!-- PIN: features -->

1. **Chat messaging** — Create, read, update, delete chat messages
2. **Reactions** — Add/remove emoji reactions to messages
3. **Mentions** — @mention users within messages
4. **Thread support** — Parent/child message relationships
5. **API documentation** — Swagger UI for development and testing

## Non-Goals
<!-- PIN: non-goals -->

- No frontend/UI components
- No WebSocket real-time delivery (separate concern)
- No user authentication (handled by API gateway)
- No file/media storage

## Architecture
<!-- PIN: architecture -->

- **Framework**: NestJS 11 with Fastify HTTP adapter
- **Database**: PostgreSQL 17 with Prisma ORM
- **Validation**: class-validator + class-transformer with global ValidationPipe
- **Documentation**: Swagger (@nestjs/swagger)
- **Pattern**: Feature-based modules, one controller per action, manager for orchestration
