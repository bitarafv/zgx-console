# Cloudflare access model

The public hostname serves the always-on web and simulation deployments. A named Tunnel on the Nano targets only `127.0.0.1:60372`.

Public allowlist: `GET /api/resources`, `/api/workloads`, `/api/policy`, and `/api/capability`. Protect `/admin*`, `/api/admin/*`, `POST /api/transitions`, and `POST /api/workloads/:id/stop` with Cloudflare Access and allow `bitarafv@gmail.com`. The application repeats this email check before mutations.

Use identical bridge-token and admin-secret values in Cloudflare deployment secrets and the Nano’s ignored `.env.local`. Never expose Siva port 18000, simulation port 60371, bridge port 60372, workload ports, tunnel credentials, or secrets directly.
