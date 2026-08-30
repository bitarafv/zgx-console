# ZGX Experiences Agent Guide

## Parallel simulation ownership

Simulation builders own exactly one directory under `src/features/simulations/<demo-slug>/`.
Builders may read the whole repository, but must not edit:

- `src/features/simulations/contracts.ts`
- `src/features/simulations/registry.ts`
- `src/features/simulations/shared/**`
- routing, global styles, the central catalog, or another simulation

Only the integration workstream updates the registry or shared contracts. If a builder needs shared functionality, report the requested change in the handoff instead of editing shared files.

## Module requirements

Every simulation module must:

- Export a `SimulationModule` from `index.ts`.
- Use deterministic local mock data only.
- Support initial, processing, success, empty, error, and reset states.
- Work with keyboard navigation and reduced-motion preferences.
- Reuse the shared simulation shell and primitives.
- Include focused tests for its primary workflow and reset behavior.
- Include complete discussion, competitive, and workload-stack configuration.

## Validation

Before handoff, run:

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

## Handoff format

Report:

1. Files changed
2. Customer workflow implemented
3. States and interactions covered
4. Validation results
5. Requested shared changes, or `None`

## Branch naming

Use `codex/demo-<demo-slug>` for simulation branches. Never run multiple active builders in the same physical worktree.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
