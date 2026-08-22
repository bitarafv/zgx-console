# Pre-implementation recovery checkpoint

The DietPlan/Siva state preceding this repository is preserved privately at tag `pre-zgx-console-2026-08-22`, commit `5dcbce94edfb5dc3eb8dc5082bba28a8a11a0488` in `bitarafv/dietplan-recovery`.

Verified environment: Node `v22.23.2`, npm `10.9.8`. The restored project declares Node 24+ and emitted an engine warning on Node 22, but lint, type checking, and its production build passed.

Package lock SHA-256: `885b5a212111ea19d031b49fd743dfac35e864cd920a9ed9b7f67bf41a6323c4`.

## Safe restore into a new directory

```bash
git clone --branch pre-zgx-console-2026-08-22 https://github.com/bitarafv/dietplan-recovery.git dietplan-restored
cd dietplan-restored
npm ci
npm run lint
npm run typecheck
npm run build
```

An independently verified offline bundle and reviewed Siva-manifest archive are stored under the original checkout's ignored `backups/pre-zgx-console-2026-08-22/` directory. Preserve a copy on separate encrypted storage.

Never reset an existing checkout as the normal restore procedure. Restore into a new directory, inspect it, and preserve all later work before considering replacement.

