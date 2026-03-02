# Dual-Repo Management: wogi-flow + wogiflow-cloud

**Added**: 2026-02-28
**Source**: User directive — formalize dual-repo architecture decisions

## Repository Ownership

| Repo | Package | Visibility | Purpose |
|------|---------|-----------|---------|
| `wogi-flow` | `wogiflow` (npm) | Public (AGPL-3.0) | Free CLI, workflow engine, all local-only features |
| `wogiflow-cloud` | `@wogiflow/teams` (client), `wogiflow-cloud-server` (server) | Private | Teams backend, client hooks, dashboard, portal logic |
| `wogiflow-portal` | N/A (static site) | Public | wogi.ai — landing page, login, signup, knowledge base |

## Hard Rule: No Teams Code in the Free Repo

Team-specific logic MUST NEVER appear in `wogi-flow`. This includes:
- Auth/login UI beyond the thin `wogi login`/`wogi logout` adapter
- Sync engines, presence, real-time features
- Team CRUD, roles, permissions
- Dashboard pages
- Server-side API routes

The free repo provides **extension points** (hooks in `lib/extension-points.js`) that the cloud client plugs into. The adapter pattern is:
- `wogi-flow` exports hook interfaces and config schema
- `@wogiflow/teams` imports those interfaces and adds team behavior
- All team logic executes from `@wogiflow/teams`, never from `wogiflow` core

## Version Management

### Independent Versions, Mutual Awareness

Each repo has its own semver version. They are NOT locked together.

- `wogi-flow` → `package.json` version (currently 1.6.0)
- `wogiflow-cloud` server → `packages/server/package.json` version (currently 0.1.0)
- `@wogiflow/teams` client → `packages/client/package.json` version (currently 0.1.0)

### Cross-Repo Version File

Each repo maintains a `.workflow/state/partner-versions.json` that records the last-known version of the other repo:

```json
// In wogi-flow:
{
  "self": { "package": "wogiflow", "version": "1.6.0" },
  "partners": {
    "wogiflow-cloud-server": { "version": "0.1.0", "checkedAt": "2026-02-28" },
    "wogiflow-teams-client": { "version": "0.1.0", "minCompatible": "1.5.0", "checkedAt": "2026-02-28" }
  }
}

// In wogiflow-cloud:
{
  "self": { "package": "wogiflow-cloud", "version": "0.1.0" },
  "partners": {
    "wogiflow": { "version": "1.6.0", "checkedAt": "2026-02-28" }
  }
}
```

**Update rule**: When releasing either repo, update `partner-versions.json` in BOTH repos.

### Compatibility Contract

The `@wogiflow/teams` client declares its minimum compatible `wogiflow` version via peerDependencies:

```json
"peerDependencies": {
  "wogiflow": ">=1.5.0"
}
```

**When to bump the minimum**:
- When the free repo removes or renames an exported function that the client uses
- When the free repo changes the shape of config.json, ready.json, or other state files
- When the free repo changes hook interfaces (entry point signatures, event payloads)

**When NOT to bump**:
- New features added to the free repo (additive changes are always compatible)
- Internal refactoring that doesn't change exports

## Interface Contract (Public API Surface)

The cloud client depends on these interfaces from `wogi-flow`. Changes to any of these require updating the client:

### Exported Functions (from scripts/)
- `flow-utils.js`: `getConfig()`, `safeJsonParse()`, `writeJson()`, `generateTaskId()`, `validateTaskId()`, `PATHS`, `getReadyData()`, `saveReadyData()`
- `flow-session-state.js`: `trackTaskStart()`, `trackBypassAttempt()`
- `flow-memory-blocks.js`: `setCurrentTask()`

### Hook Interfaces (entry point contracts)
- `PreToolUse` hooks receive: `{ tool, toolInput }` via stdin JSON
- `PostToolUse` hooks receive: `{ tool, toolInput, toolResult }` via stdin JSON
- `TaskCompleted` hooks receive: `{ taskId }` via stdin JSON
- `SessionStart`/`SessionEnd` hooks receive: `{}` via stdin JSON

### State File Formats
- `ready.json`: `{ inProgress: [], ready: [], blocked: [], recentlyCompleted: [], backlog: [] }`
- `config.json`: Schema documented in `config.schema.json`
- `decisions.md`: Markdown with `## Section` / `### Rule` structure
- `session-state.json`: `{ taskId, status, lastBriefingAt, ... }`

### Config Keys Used by Cloud
- `hooks.rules.*` — all hook toggle keys
- `enforcement.*` — strict mode, task gating
- `semanticMatching.*` — reuse detection thresholds

**When modifying any of the above**: Check wogiflow-cloud for consumers BEFORE releasing.

## Change Propagation Rules

### OSS Change → Does Cloud Need Updating?

| Change Type | Cloud Impact | Action Required |
|-------------|-------------|-----------------|
| New feature (additive) | None | No action needed |
| Bug fix (internal) | None | No action needed |
| Exported function renamed/removed | BREAKING | Update client, bump peerDep minimum |
| State file format changed | BREAKING | Update client parsers |
| Hook interface changed | BREAKING | Update client hooks |
| Config key renamed/removed | BREAKING | Update client config readers |
| New config key added | None (additive) | Client can optionally use it |

### Cloud Change → Does OSS Need Updating?

| Change Type | OSS Impact | Action Required |
|-------------|-----------|-----------------|
| New server feature | None | No action needed |
| New client hook | None | No action needed |
| Client needs new OSS export | REQUIRES | Add export to OSS, release OSS first |
| Dashboard changes | None | Entirely separate |

### Release Order

1. **OSS first**: If the cloud needs a new OSS feature, release OSS first
2. **Cloud follows**: Cloud releases independently, referencing the OSS version in peerDeps
3. **Never**: Release cloud with a dependency on an unreleased OSS version

```
OSS v1.7.0 (adds new export)
    ↓
Cloud client v0.2.0 (uses new export, peerDep bumped to >=1.7.0)
    ↓
Cloud server v0.2.0 (may or may not change)
```

## Web Properties

| Property | Repo | Purpose |
|----------|------|---------|
| wogi.ai (main site) | `wogiflow-portal` | Landing, login, signup, knowledge base |
| Dashboard (admin UI) | `wogiflow-cloud/packages/dashboard/` | Team admin — served by cloud server |

The portal is a separate deployment from the dashboard. The portal is public-facing (marketing + auth). The dashboard is authenticated (team management).

## Verification Checklist (Before Any Release)

### Releasing wogi-flow (OSS):
1. Check `partner-versions.json` — is cloud version current?
2. If any exported function/interface changed: grep wogiflow-cloud for consumers
3. Run `node --check` on all modified scripts
4. Follow GitHub Release Workflow (decisions.md)
5. After release: update `partner-versions.json` in wogiflow-cloud

### Releasing wogiflow-cloud:
1. Check `partner-versions.json` — is OSS version current?
2. Verify `peerDependencies.wogiflow` range includes current OSS version
3. If client needs new OSS export: release OSS first
4. After release: update `partner-versions.json` in wogi-flow
