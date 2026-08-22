# Contributing to ZGX Console

## Public contributors

Fork `bitarafv/zgx-console`, clone your fork, and create one branch per change. Run `npm ci` once and `npm run dev` for the mock-only console. Before opening a pull request, run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.

## Trusted collaborators

Collaborators with Write access may clone the upstream repository and push feature branches directly. `main` remains protected: changes go through pull requests and required CI.

## Nano administrators

Live Nano work is Linux-only and requires a separately installed Siva runtime. Configure ignored `.env.local` values, run `./zgx setup`, then use `./zgx start`. Use `npm run dev:nano` only on an authorized Nano. Never commit secrets, internal addresses, models, workload source, or Cloudflare credentials.

## Git identity and Copilot

Set identity in this repository only:

```bash
git config user.name "Your Name"
git config user.email "your-public-email@example.com"
```

The Git credential used to push determines repository permissions. A separate Copilot login may assist editing only when its organization policy permits work on this public personal repository; it must not replace or expose the Git credential.
