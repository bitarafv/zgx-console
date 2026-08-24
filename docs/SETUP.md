# Setup and operation

Node.js 24 or newer is required. On Windows, macOS, or Linux, run `npm ci` and `npm run dev` for the mock-only four-tab console. No Siva installation, model, tunnel, or secret is required. Open `http://localhost:60370`; ZGX Console does not use port 3000.

## Nano setup

Clone the repository to `~/projects/zgx-console`, then run:

```bash
./zgx setup
./zgx start
```

`setup` creates ignored bridge secrets in `.env.local`, validates and builds the applications, and installs two systemd user services:

- `zgx-console.service` owns web port `60370` and simulation port `60371`.
- `zgx-node-bridge.service` exclusively owns bridge port `60372`.

Siva on port `18000` and all launched workloads remain outside console lifecycle management.

## Everyday commands

```bash
./zgx start       # ensure the console is online and enable live telemetry
./zgx stop        # stop only live telemetry; keep the public console online
./zgx restart     # restart console and bridge
./zgx update      # validate, build, install current units, and activate the build
./zgx status      # show service and port ownership
./zgx logs        # follow logs for both services
./zgx shutdown    # stop console and bridge, but never Siva or workloads
```

`update` preserves bridge state: if live telemetry was active before the update, it is restored afterward. Use `update` after pulling or editing source; a plain restart does not build source files.

For live Nano development, first run `./zgx shutdown`, then `npm run dev:nano`. Development mode refuses to start if a production service owns one of the console ports.

For local admin access from another computer, forward port 60370 over SSH and browse `/admin`. Guest and Admin now use the same MVP Dashboard; controls are enabled only for authenticated Admin sessions. Do not bind the admin interface to the LAN.

The public site remains online after `./zgx stop`, and MVP Dashboard falls back to its explanatory static panel until `./zgx start` restores the bridge.
