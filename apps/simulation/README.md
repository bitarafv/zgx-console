# ZGX Demo Display

A presentation-ready, configuration-driven showcase of simulated AI software experiences across commercial and public-sector industries. It is designed for customer discovery conversations and does **not** run AI models or send data to external services.

## Start locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

- `npm run dev` — development server
- `npm run build` — optimized production build
- `npm start` — serve the production build
- `npm run lint` — static lint checks
- `npm test` — unit and configuration tests

## Architecture

- `src/data/catalog.ts` is the typed source of truth for markets, industries, demos, mock prompts, outcomes, personas, and seller guidance.
- `src/data/technology.ts` contains sourced hardware profiles, qualified workload stacks, model examples, and competitive landscapes.
- Dynamic pages under `src/app/industries/[industrySlug]` and `src/app/demos/[demoSlug]` render the catalog without per-demo route files.
- `src/components/mock-app.tsx` composes reusable copilot, document, vision, research, workflow, developer, and analytics-style simulations.
- `src/components/app-provider.tsx` persists theme and the selected Nano or Fury platform in local storage.
- `src/features/simulations` defines the isolated module contract, shared simulation primitives, integration-owned registry, and fallback renderer used for parallel demo development.

See [docs/parallel-simulation-workflow.md](docs/parallel-simulation-workflow.md) before starting concurrent Codex tasks. Each task must use a separate Git worktree and own one simulation directory.

## Extending the catalog

### Add a demo

Add a definition to `defs` in `src/data/catalog.ts`. Choose an existing archetype, then supply the problem, value proposition, and workload. Shared profile content is composed automatically; expand the definition into a dedicated object when more bespoke content is required.

### Add an industry

Add its metadata to `industryMeta`, then associate demo definitions using the same industry slug. The market page and static routes update from the configuration.

### Add hardware or workload guidance

Extend the platform union in `src/lib/types.ts`, add a sourced profile in `src/data/technology.ts`, and add qualified workload-fit language. Every factual profile must include its source and review date.

## Technology stack and competition

The Technology Stack panel always reflects the device selected on the landing page. Model families and sizing ranges are educational starting points based on memory and workload shape, not compatibility certifications or performance guarantees. Competitive software uses neutral capability summaries and category-level price ranges in each market’s native pricing unit. Sources and review dates are stored with the content.

## Deployment

Run `npm run build`, then deploy the Next.js application to any compatible Node hosting environment. No secrets, database, or external services are required.

## Disclaimer

All software workflows, processing states, citations, metrics, and outcomes are simulated. Hardware and model names are educational examples only. Validate any real deployment through discovery, solution architecture, compatibility review, and workload testing.
