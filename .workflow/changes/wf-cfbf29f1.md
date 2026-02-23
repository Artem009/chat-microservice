# [wf-cfbf29f1] Switch HTTP adapter from Express to Fastify

## Product Context
<!-- PIN: product-context -->
**Product**: chat-microservice-2
**Tagline**: A chat/messaging microservice for real-time conversations
**Type**: Backend API microservice

---

## User Story
**As a** developer
**I want** the app to use Fastify instead of Express
**So that** it matches the reference architecture and benefits from Fastify's performance

## Description
Replace the default Express HTTP adapter with Fastify. Install @nestjs/platform-fastify and fastify packages. Update main.ts bootstrap to use FastifyAdapter and NestFastifyApplication generic type. Reference: comment-microservice/src/main.ts

## Acceptance Criteria

### Scenario 1: App boots with Fastify
**Given** the application is configured with FastifyAdapter
**When** `npm run start:dev` is executed
**Then** the app starts successfully on port 3000
**And** `GET /` returns "Hello World!" (existing behavior preserved)

### Scenario 2: E2E tests pass
**Given** the HTTP adapter has been switched
**When** `npm run test:e2e` is executed
**Then** all existing E2E tests pass without modification

## Technical Notes
- Install: `@nestjs/platform-fastify`, `fastify`, `@fastify/static`
- Can optionally remove `@nestjs/platform-express` and `@types/express`
- Update `NestFactory.create` to `NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())`

## Test Strategy
- [ ] Unit: Existing app.controller.spec.ts passes
- [ ] E2E: Existing app.e2e-spec.ts passes

## Dependencies
- None (first task)

## Complexity
Low - Straightforward adapter swap in main.ts + package install
