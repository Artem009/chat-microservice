# [wf-bc6bf0fb] Install SWC compiler for faster builds

## Product Context
<!-- PIN: product-context -->
**Product**: chat-microservice-2
**Type**: Backend API microservice

---

## User Story
**As a** developer
**I want** SWC compiler installed
**So that** TypeScript compilation is faster during development

## Description
Install @swc/cli and @swc/core as devDependencies. SWC is a Rust-based TypeScript/JavaScript compiler significantly faster than tsc. Reference: comment-microservice/package.json

## Acceptance Criteria

### Scenario 1: Packages installed
**Given** @swc/cli and @swc/core are added to devDependencies
**When** `npm run build` is executed
**Then** the project builds successfully

### Scenario 2: Tests pass
**Given** SWC is installed
**When** `npm run test` is executed
**Then** all tests pass

## Technical Notes
- Install: `@swc/cli`, `@swc/core` (devDependencies)
- NestJS CLI auto-detects SWC when installed

## Dependencies
- None

## Complexity
Low - Package install only
