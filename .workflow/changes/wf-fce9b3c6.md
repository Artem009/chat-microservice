# [wf-fce9b3c6] Add docker-compose for PostgreSQL

## Product Context
<!-- PIN: product-context -->
**Product**: chat-microservice-2
**Type**: Backend API microservice

---

## User Story
**As a** developer
**I want** a docker-compose.yml for PostgreSQL
**So that** I can spin up the database with a single command

## Description
Create docker-compose.yml with postgres:17-alpine image. Configure database name, user, password, and port mapping. Reference: comment-microservice/docker-compose.yml

## Acceptance Criteria

### Scenario 1: Database starts
**Given** Docker is running
**When** `docker-compose up -d` is executed
**Then** PostgreSQL container starts on port 5432
**And** the configured database is created

### Scenario 2: App connects
**Given** the database container is running
**When** DATABASE_URL points to localhost:5432
**Then** the app can connect to PostgreSQL

## Technical Notes
- Image: postgres:17-alpine
- Container name: chat-microservice-2
- Env: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
- Port: 5432:5432

## Dependencies
- None

## Complexity
Low - Single YAML file
