# Cloudflare deployment boundary
Deploy `apps/web` and `apps/simulation` from protected `main`. The public site is always on. Route `/simulation/*` to the simulation deployment. Protect `/admin*`, `/api/admin/*`, `/api/transitions`, and `/api/workloads/*/stop` with Cloudflare Access, allowing only `bitarafv@gmail.com`.

The named Tunnel must target only `http://127.0.0.1:60372`. Store `ZGX_BRIDGE_TOKEN` and `ZGX_ADMIN_BRIDGE_SECRET` in deployment secrets and on the Nano; never put them in Git. Public web API routes proxy allowlisted reads. Mutations require both Access identity and the bridge admin secret. Do not publish ports 18000, 60371, 60372, or workload ports directly.

Actual account, hostname, Access application, secrets, and tunnel creation require the owner’s Cloudflare authorization. Never provide an account password; use Cloudflare login/API-token flows.
