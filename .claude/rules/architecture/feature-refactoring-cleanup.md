---
alwaysApply: false
description: "Cleanup checklist when refactoring or renaming features"
globs:
  - "scripts/*.js"
  - ".claude/skills/**/*"
---

# Feature Refactoring Cleanup

When refactoring, renaming, or replacing a feature, ensure complete cleanup of the old implementation.

## Mandatory Cleanup Checklist

When a feature is refactored or renamed, you MUST:

### 1. Remove Old Code
- [ ] Delete old script files (e.g., `flow-old-feature.js`)
- [ ] Remove old skill directories (e.g., `.claude/skills/old-feature/`)
- [ ] Remove old hook files if applicable

### 2. Update Configuration
- [ ] Rename config keys (e.g., `oldFeature` → `newFeature`)
- [ ] Remove from `skills.installed` array if skill was removed
- [ ] Update any feature flags

### 3. Update Documentation
- [ ] Rename/update doc files in `.claude/docs/`
- [ ] Update command references in `commands.md`
- [ ] Update skill-matching.md if skill changed
- [ ] Search for old name in all `.md` files

### 4. Clean References
- [ ] Search codebase: `grep -r "old-feature-name" .`
- [ ] Update imports in dependent scripts
- [ ] Update any hardcoded references

### 5. Update State Files
- [ ] Clean `.workflow/state/` of old state files
- [ ] Update `ready.json` if tasks reference old feature
- [ ] Archive old change specs

## Search Commands

Run these to find lingering references:

```bash
# Find all references to old feature
grep -r "old-feature-name" --include="*.js" --include="*.md" --include="*.json" .

# Find in config
grep "oldFeatureName" .workflow/config.json

# Find skill references
grep -r "old-feature" .claude/
```

## Why This Matters

Incomplete cleanup causes:
- **Confusion**: Old commands/skills appear to work but don't
- **Bloat**: Dead code accumulates
- **Errors**: Old references cause runtime failures
- **Documentation drift**: Docs describe non-existent features

## Example: transcript-digestion → long-input-gate

When this refactoring happened without proper cleanup:

| Artifact | Status | Should Have Been |
|----------|--------|------------------|
| `.claude/skills/transcript-digestion/` | Left behind | Deleted |
| `config.transcriptDigestion` | Left as-is | Renamed to `longInputGate` |
| `skills.installed` array | Still listed | Removed |
| `skill-matching.md` | Old references | Updated |
| `transcript-digestion.md` doc | Still existed | Renamed/rewritten |

## Automation Opportunity

Consider adding a `flow refactor-cleanup <old-name> <new-name>` command that:
1. Searches for all references
2. Shows what needs updating
3. Optionally auto-updates simple cases

---

Last updated: 2026-01-14
