# [wf-fa3de969] Create LocalApiProperty decorator

## Product Context
<!-- PIN: product-context -->
**Product**: chat-microservice-2
**Type**: Backend API microservice

---

## User Story
**As a** developer
**I want** API properties that only appear in Swagger when running in LOCAL mode
**So that** fields like currentUserId are visible for testing but hidden in production docs

## Description
Create src/common/decorators/local-api-property.decorator.ts and src/common/constants/mode.ts. LocalApiProperty composes @IsString() with conditional @ApiProperty() based on MODE=LOCAL env var. Reference: comment-microservice/src/common/

## Acceptance Criteria

### Scenario 1: LOCAL mode shows field
**Given** MODE=LOCAL environment variable is set
**When** Swagger UI is accessed
**Then** fields decorated with @LocalApiProperty appear in documentation

### Scenario 2: Non-local mode hides field
**Given** MODE is not set or not LOCAL
**When** Swagger UI is accessed
**Then** fields decorated with @LocalApiProperty are hidden from docs
**And** @IsString() validation still applies

## Technical Notes
- Create: `src/common/constants/mode.ts` with ENV_MODE const
- Create: `src/common/decorators/local-api-property.decorator.ts`
- Uses `applyDecorators()` from @nestjs/common

## Dependencies
- wf-f548c77a (Swagger — needed for @ApiProperty)
- wf-4d288338 (class-validator — needed for @IsString)

## Complexity
Low - 2 small files
