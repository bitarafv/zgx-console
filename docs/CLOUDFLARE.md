# Cloudflare deployment boundary

## Required routing

Deploy the Next.js application behind Cloudflare and connect the Nano with a named Tunnel. Keep Siva on `127.0.0.1:18000`.

Public read routes:

- `GET /api/resources`
- `GET /api/workloads`
- `GET /api/policy`
- `GET /api/capability`

Protected mutation routes:

- `POST /api/transitions`
- `POST /api/workloads/:id/stop`

Create a Cloudflare Access application covering the mutation paths and allow only the owner's identity. The server also checks the authenticated email against the secret `ZGX_ADMIN_EMAILS`; UI button state is not authorization.

Use production secrets for `ZGX_NODE_ORIGIN` and `ZGX_ADMIN_EMAILS`. Apply rate limits to public telemetry, disable caching, and do not create a wildcard proxy. Tunnel credentials must remain on the Nano or in the deployment secret store.

