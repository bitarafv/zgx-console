# Cloudflare access model

`https://zgxconsole.bncvc.com` is routed by the existing named Tunnel to the loopback-only web origin at `http://127.0.0.1:60370`. This is required to serve the four-tab UI. The web server alone calls the token-protected node bridge at `127.0.0.1:60372`; never add a public hostname that targets 60372 or Siva port 18000 directly.

Public allowlist: `GET /api/resources`, `/api/workloads`, `/api/policy`, and `/api/capability`.

Create Cloudflare Access applications for `/admin*`, `/api/admin/*`, `/api/transitions`, and `/api/workloads/*/stop`, allowing only `bitarafv@gmail.com`. The application independently verifies the Access email before enabling mutations. Without the Access identity, `/api/admin/*` returns 403 even if the edge policy is missing.

The system `cloudflared.service` owns the existing multi-application tunnel and remains always on. Do not reinstall it from the ZGX launcher. Tunnel credentials stay in root-protected or chmod-600 local secret storage and never enter Git.
