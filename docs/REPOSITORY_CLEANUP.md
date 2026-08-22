# Repository cleanup record

## Simulation source copy

Compared on 2026-08-22:

- Legacy path: `/home/bitarafv/zgx-console-copied-mac/zgx-demo-display-codex`
- Legacy remote: `https://github.com/bitarafv/demo-display-codex`
- Legacy HEAD: `8001725307f74abb0d9565ad0b1964a1d9d05cdf`
- Canonical destination: `apps/simulation`

A checksum comparison excluding `.git`, dependencies, builds, generated TypeScript state, local environment files, logs, and PID files found only intentional monorepo adaptations: the `/simulation` base path, workspace output tracing, a typecheck script, generated Next route references, and whitespace formatting. The modified `AGENTS.md` is identical to the imported file. No unique publishable source remains only in the local copy. The legacy Git history remains recoverable from its GitHub remote.

## agentic-runtime-lab

Do not delete. Its `feature/qwen-workload-and-lifecycle` history is unrelated to `siva-platform`, and the working tree contains unique modified and untracked Qwen, Open WebUI, lifecycle telemetry, port inspection, and workflow files. It requires its own recovery checkpoint and promotion review before any cleanup.

## Repositories that remain separate

- `siva-platform`: runtime and workload-policy authority.
- `dietplan`, `noteai`, and other managed applications: independently deployable Siva workloads.
- `zgx-console`: public four-tab console, sanitized mocks, contracts, and optional loopback bridge.
