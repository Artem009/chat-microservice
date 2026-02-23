---
description: "Patterns for modifying WogiFlow itself (scripts, templates, config)"
alwaysApply: false
globs: "scripts/**,*.workflow/**,.claude/**,templates/**,agents/**,lib/**"
---

# WogiFlow Self-Maintenance Patterns

When modifying WogiFlow's own code (scripts/, templates/, config, hooks), follow these patterns.

## 1. Template-First Changes

CLAUDE.md is **generated**, not hand-edited. Changes must go through the template system:

```
.workflow/templates/claude-md.hbs       # Main template
.workflow/templates/partials/*.hbs      # Partial templates
```

After editing templates, regenerate:
```bash
node scripts/flow-bridge.js sync claude-code
```

**Never edit CLAUDE.md directly** - changes will be overwritten on next sync.

## 2. Three-Layer Hook Architecture

All hooks follow: Entry → Core → Adapter

```
scripts/hooks/entry/claude-code/<name>.js  # CLI-specific entry point
scripts/hooks/core/<name>.js               # CLI-agnostic logic
scripts/hooks/adapters/claude-code.js      # Transform results
```

When adding/modifying hooks:
- Logic goes in `core/` (not entry)
- Entry files only parse input and call core
- Register hook in `.claude/settings.local.json`
- Add config toggle in `.workflow/config.json` under `hooks.rules`

## 3. Config Changes Need Documentation

When adding config keys:
- Use `_comment_<keyName>` for inline documentation of non-obvious settings
- Update config.schema.json if it exists
- Ensure `lib/installer.js` handles the new key for fresh installs

## 4. State File Templates

For files in `.workflow/state/` that target projects need:
- Create both the file AND a `.template` version
- Templates go in `.workflow/state/<name>.template` (for init/onboard)
- Also add to `templates/` directory (for npm distribution)

## 5. Slash Commands Are Flat Files

Slash commands in `.claude/commands/` must be flat `.md` files:
```
.claude/commands/wogi-start.md     ← Correct (flat file)
.claude/commands/wogi-start/       ← Wrong (directory)
```

## 6. Two Agent Directories

| Directory | Purpose | Used By |
|-----------|---------|---------|
| `agents/` | 11 persona files | Health checks, CLI |
| `.workflow/agents/` | Review checklists | wogi-review |

Don't confuse them. `agents/security.md` (persona) is different from `.workflow/agents/security.md` (OWASP checklist).

## 7. Regression Prevention

When modifying flow-*.js scripts:
- Run `node --check scripts/<file>.js` after edits
- WogiFlow has no test suite - syntax checking is the safety net
- Check for circular dependencies when moving shared functions

## 8. Feature Refactoring Cleanup

When renaming/replacing a feature, follow the full checklist in `.claude/rules/architecture/feature-refactoring-cleanup.md`. Key steps:
- Remove old script files
- Update config keys
- Update documentation references
- Search all `.md` files for old name
