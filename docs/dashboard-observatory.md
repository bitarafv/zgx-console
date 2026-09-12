# Reversible dashboard observatory

## Scope and baseline

Baseline: `a38717abd71ee2816a4da21750aa16345fcbd0da` on `main`.
Implementation branch: `feat/reversible-live-dashboard`.

The ZGX Node section offers **Live Telemetry** and **Installed Applications**.
The default telemetry view is designed for a narrow browser beside an application.
`/monitor` opens an independent, read-only view without console navigation.
Focus mode enlarges the panel in place, traps keyboard focus, and exits with Escape.

`NodeDashboard.tsx` and `SivaAdminFrame.tsx` are left byte-for-byte unchanged.
Classic mode uses the original public dashboard or original embedded admin console,
respectively, without the redesigned view's scoped styles. New admin mode also
retains the embedded console under **Original runtime administration — unchanged**,
mounted only when opened. This change does not redesign that remote iframe's
internal pages. No backend, contract, model, admission policy, mutation
authorization, global stylesheet, or dependency changes.

## Insight-preservation inventory

| Original insight | Unchanged source fields | New location |
|---|---|---|
| Inference speed | `inference_speed.tokens_per_second`, `average`, `peak`, `source`, `available` | Primary readout, large history chart, full details |
| Allocated model memory | `allocated_model_memory` and original `gpu.mode === "memory"` fallback | Primary readout, resource history, full details/raw snapshot |
| Tensor active | `tensor_core.active_percent`, `average`, `peak`, `source`, `available` | Primary readout, resource history, full details |
| Memory bandwidth | `memory_bandwidth.current_gbps`, `maximum_gbps`, `average`, `peak`, `source`, `available` | Primary readout, resource history, full details |
| SoC power | `soc_power.current_watts`, `limit_watts`, `average`, `peak`, `source`, `available` | Health strip, resource history, full details |
| Installed workloads | Name, description, active state, model names, intelligence services | Installed Applications; pinned observation context |
| Launch/switch and stop | Existing `/api/transitions` and `/api/workloads/:id/stop` POST routes | Authenticated app controls; original admin console retained |
| Public/static state | Existing capability endpoint and original offline message | Offline panel; withdrawal of sharing clears browser measurements |

GB/s remains GB/s. MiB model allocation is converted to GiB by dividing by 1024,
as in the original view. Allocation is not presented as available system memory;
reported tensor activity is not renamed GPU utilization; SoC power is not wall
power. The raw reported resource object remains inspectable. Average and peak
values are labeled runtime-reported with an unspecified averaging window.

First-token latency, queue depth, temperature, request stages, per-application
attribution, and model readiness are **not instrumented** in the current contract.
The UI states this rather than introducing synthetic readings or inferred stages.
Selecting an application pins context; it does not claim all device measurements
belong to that app. No local-data privacy guarantee is inferred from activity.
The active flag is not treated as proof of model readiness. Application URLs use
only existing runtime fields and accept HTTP(S), never invented ports.

## Reversal without a code change

- **Classic view** or **Restore Classic view** restores the original dashboard.
- **Use redesigned dashboard** returns to the redesign.
- **View options & reversible features** separately controls large readouts,
  charts, observed activity/chart markers, and graphite styling.
- **Restore redesigned defaults** resets presentation preferences only.
- **Pause display** freezes a timestamped snapshot, not inference or collection.
- **Exit focus** or Escape restores the normal page layout.

Preferences use `localStorage["zgx.dashboard.options.v1"]`, with an in-memory
fallback when storage is blocked. Invalid stored values revert to safe defaults.
The `dashboard=classic` or `dashboard=observatory` query parameter overrides the
stored layout choice. `workload=<id>` pins a monitor's context independently of
other windows' selection. The initial subtab is Live Telemetry; later visits use
the last selected subtab. The dedicated monitor always shows telemetry.

Direct paths after deployment:

```text
/?dashboard=classic#node
/admin?dashboard=classic#node
/?dashboard=observatory#node
/monitor?dashboard=observatory
```

Deployment-level kill switch: set `NEXT_PUBLIC_ZGX_DASHBOARD_V2=false` **at build
time**, rebuild, and redeploy. This selects Classic on normal and monitor routes.
It is not a dynamic server flag and does not mutate app state or stop workloads.
For source rollback, revert the redesign commit (or the merged PR's merge/squash
commit) on a new branch. Do not use `reset --hard`, rewrite shared history, or
restore the entire old repository over unrelated subsequent changes. There are
no database or API migrations to reverse.

## Live-data semantics and safety

The existing capability/resources/workloads endpoints are polled once per second
while a window is visible. Requests are single-flight, time out after 4.5 seconds,
and are aborted on unmount. Each monitor window has its own read-only poller; it
can remain open after the application launcher window closes.

Freshness checks **source time**, not just successful HTTP receipt: samples older
than five seconds, clock skew over five seconds, failed polling, or server stale
status show Stale. No successful receipt for 15 seconds shows Disconnected.
Mock mode is visibly marked as demonstration data, never live hardware. Missing
metrics render Unavailable; measured zeros remain zero. Controls require the
existing live-admin capability and are disabled on stale/disconnected data.
The monitor route is always read-only. Server-side permissions remain authoritative.

The new history holds up to 600 source-timestamped samples, covering at most ten
minutes. Duplicate/out-of-order timestamps are not appended. Lines break across
unavailable readings and gaps longer than 3.5 seconds. The 2/5/10-minute selector
changes display range only. Pause retains its snapshot while collection continues
in a visible window; live connection warnings remain visible. Switching between
the two new subtabs does not reset collection. Changing data mode or withdrawing
sharing clears retained history to prevent mixing demo/live or unshared data.

History is browser-session data, not a persistent telemetry database. Refreshing,
closing the window, switching to Classic, or leaving the ZGX Node section resets
this new in-memory history. No pre-existing backend history is deleted or changed.
Observed events describe reported workload active-state changes, timestamped when
seen by this browser. They are not request starts, first tokens, or sleep/wake
stages. No requests, patient data, prompts, or application outputs are collected.

## Validation and remaining checks

Local checks completed on the initial implementation before publication:

- All 16 cases in `observatory.test.ts` executed using a Node assert compatibility
  harness; all passed. This was **not** a run of the Vitest binary.
- The pure telemetry helper and its contract imports passed strict TypeScript
  checking against TypeScript 5.8.3.
- Authored TS/TSX passed TypeScript transpilation/syntax validation.
- The initial CSS module parsed successfully with PostCSS.

Final integration additionally uses Next Link for internal routes and isolates
Classic styling. Full React typing, lint, production build, browser interaction,
and live-hardware verification are not claimed by the limited local checks.
The existing PR CI runs `npm ci`, tests, lint, typecheck, and build on Node 24;
its returned result is authoritative, not this checklist.

Before deployment, check at 800x900, 960x1080, 1440x900, and a narrow mobile width:

1. Original five readings match the same API sample in Classic and the redesign.
2. Telemetry/application subtab changes preserve history; monitor selection is
   pinned; the monitor survives closing its parent; guests cannot mutate workloads.
3. Pausing freezes numbers/charts/events but not requests; resume shows current data.
4. Old timestamps, failed requests, invalid/missing values, real zeros, and sharing
   withdrawal produce the stated labels and disabled controls.
5. Keyboard tab navigation, Focus/Escape, mobile layout, and reduced-motion settings
   work; primary readings and charts fit the intended focus-monitor viewport.
6. Each feature toggle, Classic restore, query override, storage-blocked behavior,
   build-time kill switch, and rendering-error fallback works.
7. App Open uses the actual returned URL; launch/stop work through existing admin
   authorization; the original embedded runtime administration remains reachable.

Keep the PR unmerged until these checks and the desired visual review are complete.
