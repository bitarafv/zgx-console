# ZGX Console

ZGX Console is the main four-tab application: Demo Display, MVP Dashboard, Enterprise AI Insights, and TCO Calculator.

## Repository map

- `apps/web`: main console, public/static node state, and authenticated admin UI.
- `apps/simulation`: exact Nano/Fury simulation experience.
- `apps/node-bridge`: loopback-only allowlisted bridge to Siva.
- `packages/contracts`: shared workload and telemetry types.
- `scripts/zgx`: lifecycle implementation used by the root `./zgx` command.
- `deploy`: Cloudflare boundary and systemd user-service templates for the console and live bridge.

## Develop on Windows, macOS, or Linux

Node.js 24 or newer is required. The default workflow is mock-only and does not require Siva, models, Nano hardware, Cloudflare, or local secrets:

```bash
npm ci
npm run dev
```

Open `http://localhost:60370` (not port 3000, which may belong to another application). The same running service is published at `https://zgxconsole.bncvc.com`. See `CONTRIBUTING.md` for forks, branches, pull requests, and repository-local Git identity.

## Easy Nano commands

```bash
./zgx setup       # one-time install, validation, build, and user-service setup
./zgx start       # keep the console online and enable live Nano telemetry
./zgx stop        # disable live telemetry; the public console stays online
./zgx restart     # restart the console and live bridge cleanly
./zgx update      # validate, build, activate changes, and preserve bridge state
./zgx status      # show service ownership, ports, tunnel, and Siva state
./zgx logs        # follow console and bridge service logs
./zgx shutdown    # stop the console and bridge; leave Siva/workloads untouched
```

Open `http://localhost:60370`. For remote local administration, forward it over SSH:

```bash
ssh -L 60370:127.0.0.1:60370 bitarafv@ZGX_NANO_ADDRESS
```

Then open `http://localhost:60370/admin`.

For live development on an authorized Nano, use `npm run dev:nano`.

## Runtime boundary

The public cloud deployment is always available. With the Nano bridge inactive, MVP Dashboard intentionally displays: “The metrics would appear when the Admin runs the apps on their ZGX Nano.” While `./zgx start` is active, guests and admins share the same dashboard; guests can see telemetry but only authenticated admins can control workloads. Cloudflare Access protects `/admin` and every mutation route.

Ports: web `60370`, simulation `60371`, node bridge `60372`, Siva `18000`. All Nano ports bind to loopback; Cloudflare Tunnel targets only the web console. See `deploy/cloudflare/README.md`.
