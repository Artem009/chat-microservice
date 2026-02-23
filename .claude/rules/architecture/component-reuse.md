---
globs: src/components/**/*
alwaysApply: false
description: "Component reuse policy - always check app-map.md before creating components"
---

# Component Reuse Policy

**Rule**: Always check `app-map.md` before creating any component.

## Priority Order

1. **Use existing** - Check if component already exists in app-map
2. **Add variant** - Extend existing component with a new variant
3. **Extend** - Create a wrapper/HOC around existing component
4. **Create new** - Only as last resort

## Before Creating Components

```bash
# Check app-map first
cat .workflow/state/app-map.md | grep -i "button"

# Or search codebase
grep -r "Button" src/components/
```

## Variant vs New Component

Prefer variants when:
- Same base functionality, different appearance
- Same HTML structure, different styling
- Same component, different size/color/state

Create new component when:
- Fundamentally different functionality
- Different DOM structure
- Different state management
