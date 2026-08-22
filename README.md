# ZGX Console

ZGX Console is the main four-tab application: Simulation Dashboard, ZGX Node, Enterprise AI Insights, and TCO Calculator.

## Repository map

- `apps/web`: main console, public/static node state, and authenticated admin UI.
- `apps/simulation`: exact Nano/Fury simulation experience.
- `apps/node-bridge`: loopback-only allowlisted bridge to Siva.
- `packages/contracts`: shared workload and telemetry types.
- `scripts/zgx`: lifecycle implementation used by the root `./zgx` command.
- `deploy`: Cloudflare boundary and optional user-service template.

## Develop on Windows, macOS, or Linux

Node.js 24 or newer is required. The default workflow is mock-only and does not require Siva, models, Nano hardware, Cloudflare, or local secrets:

```bash
npm ci
npm run dev
```

Open `http://localhost:60370`. See `CONTRIBUTING.md` for forks, branches, pull requests, and repository-local Git identity.

## Easy Nano commands

```bash
./zgx setup       # first time, or after dependency changes
./zgx start       # activate local console + live Nano bridge
./zgx status
./zgx logs
./zgx stop        # hides live Node; public console stays online
./zgx shutdown    # intentionally stop the public console too
```

Open `http://localhost:60370`. For remote local administration, forward it over SSH:

```bash
ssh -L 60370:127.0.0.1:60370 bitarafv@ZGX_NANO_ADDRESS
```

Then open `http://localhost:60370/admin`.

For live development on an authorized Nano, use `npm run dev:nano`.

## Runtime boundary

The public cloud deployment is always available. With the Nano bridge inactive, ZGX Node intentionally displays: “The metrics would appear when the Admin runs the apps on their ZGX Nano.” While `./zgx start` is active, guests can see telemetry but cannot control workloads. Cloudflare Access protects `/admin` and every mutation route.

Ports: web `60370`, simulation `60371`, node bridge `60372`, Siva `18000`. All Nano ports bind to loopback; Cloudflare Tunnel targets only the web console. See `deploy/cloudflare/README.md`.
