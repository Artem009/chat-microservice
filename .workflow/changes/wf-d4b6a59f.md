# [wf-d4b6a59f] Create custom exception classes

## Product Context
<!-- PIN: product-context -->
**Product**: chat-microservice-2
**Type**: Backend API microservice

---

## User Story
**As a** developer
**I want** custom exception classes with structured error responses
**So that** API errors have consistent format: { message, error, createdAt }

## Description
Create exeption/ directory at project root with BadRequestException and NotFoundException extending HttpException. Include Error interface that prevents overriding reserved fields. Barrel export via index.ts. Reference: comment-microservice/exeption/

## Acceptance Criteria

### Scenario 1: BadRequestException response format
**Given** a controller throws new BadRequestException('Invalid input')
**When** the response is returned
**Then** body contains `{ message: 'Invalid input', error: 'bad_request_exception', createdAt: '<ISO date>' }`
**And** HTTP status is 400

### Scenario 2: NotFoundException response format
**Given** a controller throws new NotFoundException('Not found')
**When** the response is returned
**Then** body contains `{ message: 'Not found', error: 'not_found_exception', createdAt: '<ISO date>' }`
**And** HTTP status is 404

## Technical Notes
- Create: `exeption/index.ts`, `exeption/bad_request_exception.exception.ts`, `exeption/not-found-exception.exception.ts`, `exeption/errorInterface.ts`
- Error interface uses `never` type for reserved fields to prevent overriding

## Test Strategy
- [ ] Unit: Throw each exception, verify response structure

## Dependencies
- None

## Complexity
Low - 4 small files
