# Feedback Patterns

Patterns learned from bugs, failures, and user feedback.

| Date | Pattern | Description | Count | Action |
|------|---------|-------------|-------|--------|
| 2026-03-02 | missing-fk-validation | Controllers using Prisma `connect` without validating FK record exists first. Causes P2025 errors (500 instead of 404). | 1 | Validate FK references before create/update |
