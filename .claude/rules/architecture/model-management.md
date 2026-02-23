---
globs: scripts/flow-model*.js
alwaysApply: false
description: "Model management architecture - two separate systems for different purposes"
---

# Model Management Architecture

**Context**: Phase 1 introduced model registry and stats system alongside existing model-adapter.

## Two Model Systems

### 1. flow-model-adapter.js - Prompt Adaptation

- `getCurrentModel()` returns normalized model name (string)
- Focus: Per-model prompt adjustments, learning, and corrections
- Imports: Used by flow-knowledge-router.js

### 2. flow-models.js - Registry and Stats

- `getCurrentModel()` returns `{name, info, source}` object
- Focus: Model listing, routing recommendations, cost tracking
- Standalone CLI commands: `flow models [subcommand]`

## Design Decision

**Keep them separate** because:
- Different return types serve different consumers
- Adapter system needs just the name for pattern matching
- Registry system needs full model metadata for display/routing
- Merging would create unnecessary coupling

## Future Consideration

Could extract shared model detection logic into a common utility if they drift apart, but avoid premature abstraction.
