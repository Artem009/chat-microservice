---
alwaysApply: true
description: "Naming conventions for files and code variants"
---

# Naming Conventions

## File Names

Use **kebab-case** for all file names in this project.

Examples:
- `flow-health.js` (correct)
- `flowHealth.js` (incorrect)
- `flow_health.js` (incorrect)

## Variant Names

Use consistent variant names for components:

| Category | Values |
|----------|--------|
| Size | `sm`, `md`, `lg`, `xl` |
| Intent | `primary`, `secondary`, `danger`, `success`, `warning` |
| State | `default`, `hover`, `active`, `disabled` |

Examples:
```jsx
<Button size="sm" intent="primary" />
<Badge variant="warning" />
```

## Catch Block Variables

Use `err` for all catch blocks in this codebase.

**Avoid**: `e`, `error`, `ex`, `exception` - these cause confusion with loop variables.

```javascript
// Good
try {
  doSomething();
} catch (err) {
  console.error(err.message);
}

// Bad - 'e' conflicts with common iterator variables
try {
  items.map(e => e.value);  // 'e' used as iterator
} catch (e) {
  console.error(e.message);  // Easy to confuse with iterator 'e'
}
```

**Reason**: Standardizing on `err` prevents mix-ups when `.map(e => ...)` is used nearby.
