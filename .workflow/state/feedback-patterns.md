# Feedback Patterns

Patterns learned from bugs, failures, and user feedback.

| Date | Pattern | Description | Count | Action |
|------|---------|-------------|-------|--------|
| 2026-03-02 | missing-fk-validation | Controllers using Prisma `connect` without validating FK record exists first. Causes P2025 errors (500 instead of 404). | 1 | Validate FK references before create/update |
| 2026-03-02 | test-mock-drift | When adding validation to controllers, E2E test mocks must be updated to cover new service calls. Bugfix wf-caf5fe8e added conversationService.findOne() but tests didn't mock prisma.conversation.findUnique. | 1 | After any controller change, check ALL E2E tests that call that endpoint |
