# Parallel simulation workflow

## One-time setup

1. Keep `main` passing lint, types, tests, and build.
2. Create each builder branch from the same validated integration commit.
3. Give each builder a distinct Git worktree. Never reuse the main workspace.
4. Keep one workstream available for registry updates, review, and integration.

## Recommended wave

Run three builders at a time:

| Worktree | Branch | Owned directory |
| --- | --- | --- |
| `../zgx-clinical-scribe` | `codex/demo-clinical-scribe` | `src/features/simulations/clinical-scribe/**` |
| `../zgx-radiology-assistant` | `codex/demo-radiology-assistant` | `src/features/simulations/radiology-assistant/**` |
| `../zgx-risk-analyst` | `codex/demo-risk-analyst` | `src/features/simulations/risk-analyst-copilot/**` |

The integrator reviews each branch, requests changes inside the owned directory, then adds accepted modules to `registry.ts`. Merge one module at a time and validate after every merge.

## Builder prompt

```text
Build the <DEMO NAME> simulation as a bespoke module.

Ownership:
- Create or edit only src/features/simulations/<DEMO SLUG>/**.
- Read the entire repository as needed.
- Do not edit shared components, registry, catalog, routing, global styles, or another simulation.
- Report shared functionality requests in the handoff instead of changing shared files.

Requirements:
- Export a SimulationModule from index.ts.
- Implement a realistic multi-step customer workflow with deterministic local data.
- Cover initial, processing, success, empty, error, and reset states.
- Support keyboard interaction and reduced motion.
- Use the shared simulation shell and primitives.
- Own the demo's discussion, competitive, and technology-stack configuration.
- Add tests for the primary workflow and reset behavior.
- Run lint, TypeScript, tests, and the production build.

Handoff:
- Files changed
- Workflow and interactions
- States covered
- Validation results
- Requested shared changes, or None
```

## Integration checklist

- Confirm the builder changed only its owned directory.
- Review product behavior and deterministic mock data.
- Confirm all required states and reset behavior.
- Add the static module import to the integration-owned registry.
- Run the full validation suite.
- Preview the customer journey at desktop and tablet presentation widths.
