# Project Rules

This directory contains coding rules and patterns for this project, organized by category.

## Structure

```
.claude/rules/
├── code-style/           # Naming conventions, formatting
│   └── naming-conventions.md
├── security/             # Security patterns and practices
│   └── security-patterns.md
├── architecture/         # Design decisions and patterns
│   ├── component-reuse.md
│   └── model-management.md
└── README.md
```

## How Rules Work

Rules are automatically loaded by Claude Code based on:
- **alwaysApply: true** - Rule is always loaded
- **alwaysApply: false** - Rule is loaded based on `globs` or `description` relevance
- **globs** - File patterns that trigger rule loading

## Adding New Rules

1. Choose the appropriate category subdirectory
2. Create a `.md` file with frontmatter:

```yaml
---
alwaysApply: false
description: "Brief description for relevance matching"
globs: src/**/*.ts  # Optional: only load for these files
---
```

3. Write the rule content in markdown

## Categories

| Category | Purpose |
|----------|---------|
| code-style | Naming conventions, formatting, file structure |
| security | Security patterns, input validation, safe practices |
| architecture | Design decisions, component patterns, system organization |

## Auto-Generation

Some rules can be auto-generated from `.workflow/state/decisions.md`:

```bash
node scripts/flow-rules-sync.js
```

The sync script will route rules to appropriate category subdirectories.

---
Last updated: 2026-01-12
