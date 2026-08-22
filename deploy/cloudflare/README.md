# Deployed boundary

Public hostname: `zgxconsole.bncvc.com` -> `http://127.0.0.1:60370` through the existing system Cloudflare Tunnel.

Internal-only chain: web `60370` -> authenticated node bridge `60372` -> Siva `18000`. Simulation `60371` is reached only through the web rewrite. All listeners bind to `127.0.0.1`.

Cloudflare Access must protect `/admin*`, `/api/admin/*`, `/api/transitions`, and `/api/workloads/*/stop` for `bitarafv@gmail.com`. Public GET telemetry routes bypass Access. A tunnel token does not grant permission to create Access applications; use the Zero Trust dashboard or a narrowly scoped Cloudflare API token.
