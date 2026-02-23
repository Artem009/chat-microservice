---
alwaysApply: true
description: "All AI-context documents must use PIN markers for targeted context loading"
---

# Document Structure for AI Context

All documents in `.workflow/` that are used as AI context MUST follow the PIN standard.

## Required Structure

### 1. Header with PIN List
Every document starts with a comment listing all pins in the document:
```markdown
<!-- PINS: pin1, pin2, pin3 -->
```

### 2. Section PIN Markers
Each major section has a PIN marker comment:
```markdown
### Section Title
<!-- PIN: section-specific-pin -->
[Content]
```

### 3. PIN Naming Convention
- Use kebab-case: `user-authentication`, not `userAuthentication`
- Use semantic names: `error-handling`, not `eh`
- Use compound names for specificity: `json-parse-safety`

## Why PINs Matter

The PIN system enables:
1. **Targeted context loading**: Only load sections relevant to current task
2. **Cheaper model routing**: Haiku can fetch only relevant sections for Opus
3. **Change detection**: Hash sections independently for smart invalidation
4. **Cross-reference**: Link sections by PIN across documents

## Example Document

```markdown
# Config Reference

<!-- PINS: database, authentication, api-keys, environment -->

## Database Settings
<!-- PIN: database -->
| Setting | Default | Description |
|---------|---------|-------------|

## Authentication
<!-- PIN: authentication -->
| Setting | Default | Description |
|---------|---------|-------------|
```

## Parsing

The PIN system automatically parses documents with:
- `flow-section-index.js` - Generates section index with pins
- `flow-section-resolver.js` - Resolves sections by PIN lookup
- `getSectionsByPins(['auth', 'security'])` - Fetch only relevant sections

## Files That Must Have PINs

| File | Required PINs |
|------|---------------|
| `decisions.md` | Per coding rule/pattern |
| `app-map.md` | Per component/screen |
| `product.md` | Per product section |
| `stack.md` | Per technology |

## Validation

Run `node scripts/flow-section-index.js --force` to regenerate the index.
Check `.workflow/state/section-index.json` for indexed sections and their pins.
