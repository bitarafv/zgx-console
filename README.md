# ZGX Console

ZGX Console is a four-part web interface for exploring local AI use cases, viewing and operating a physical ZGX Nano, learning enterprise deployment concepts, and comparing total cost of ownership.

## Local development

Requires Node.js 24 or newer.

```bash
cp .env.example .env.local
npm install
npm run dev
```

The default `mock` mode requires no Siva runtime, GPU, model, tunnel, or private endpoint. Set `ZGX_MOCK_ADMIN=true` only when testing local controls.

## Runtime modes

- `mock`: deterministic fixture workloads and simulated live metrics.
- `node`: proxies a private localhost Siva endpoint and grants local admin capability.
- `cloud`: proxies the allowlisted API surface and trusts Cloudflare Access identity headers for admin authorization.

Never expose the Siva listener directly. In production, route traffic through a same-origin Worker/Tunnel configuration, make telemetry GET routes public, and require Cloudflare Access on mutation routes. Set `ZGX_ADMIN_EMAILS` in deployment secrets, never in source.

See [docs/SETUP.md](docs/SETUP.md), [docs/CLOUDFLARE.md](docs/CLOUDFLARE.md), and [docs/RECOVERY.md](docs/RECOVERY.md).

