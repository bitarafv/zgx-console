import type { Capability, Resources, Workload } from "./types";

export const RETENTION_MS = 10 * 60_000;
export const STALE_MS = 5_000;
export const DISCONNECTED_MS = 15_000;
export type MetricId = "speed" | "memory" | "tensor" | "bandwidth" | "power";
export type Reading = {
  id: MetricId; label: string; unit: string; value: number | null;
  maximum: number | null; reference: string; average: number | null;
  peak: number | null; source: string; note: string;
};
export type Sample = { at: number; values: Record<MetricId, number | null> };
export type Observation = { id: string; at: number; text: string };
export type Freshness = "Connecting" | "Live" | "Demo data" | "Stale" | "Disconnected" | "Offline";
export const finite = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
export const formatValue = (value: number | null): string =>
  value === null ? "Unavailable" : value.toLocaleString("en-US", { maximumFractionDigits: 1 });

/** Preserve the existing five measurements. Allocation is NOT free system memory. */
export function readings(resources: Resources | null): Reading[] {
  const speed = resources?.inference_speed, tensor = resources?.tensor_core;
  const bandwidth = resources?.memory_bandwidth, power = resources?.soc_power;
  const gpu = resources?.gpu;
  const memory = resources?.allocated_model_memory ?? (gpu?.mode === "memory" ? {
    allocated_mib: gpu.workload_used_mib, capacity_mib: gpu.total_mib,
    available: true, source: "nvidia-smi",
  } : undefined);
  const value = (v: unknown, available?: boolean) => available === false ? null : finite(v);
  const gib = (v: unknown) => { const n = finite(v); return n === null ? null : n / 1024; };
  const stats = (v?: { source?: string; average?: number | null; peak?: number | null; available?: boolean }) => ({
    source: typeof v?.source === "string" && v.source ? v.source : "Source not reported", average: value(v?.average, v?.available), peak: value(v?.peak, v?.available),
  });
  return [
    { id: "speed", label: "Inference speed", unit: "tok/s", value: value(speed?.tokens_per_second, speed?.available), maximum: finite(speed?.peak), reference: "Reported peak", ...stats(speed), note: "Runtime aggregate; not attributed to the selected application. Averaging window not reported." },
    { id: "memory", label: "Allocated model memory", unit: "GiB", value: memory?.available ? gib(memory.allocated_mib) : null, maximum: gib(memory?.capacity_mib), reference: "Reported capacity", average: null, peak: null, source: typeof memory?.source === "string" && memory.source ? memory.source : "Source not reported", note: "Model allocation, separate from memory traffic. Not a measure of free system memory." },
    { id: "tensor", label: "Tensor active", unit: "%", value: value(tensor?.active_percent, tensor?.available), maximum: 100, reference: "Percentage scale", ...stats(tensor), note: "Reported tensor activity; not a substitute for whole-GPU utilization." },
    { id: "bandwidth", label: "Memory bandwidth", unit: "GB/s", value: value(bandwidth?.current_gbps, bandwidth?.available), maximum: finite(bandwidth?.maximum_gbps), reference: "Reported maximum", ...stats(bandwidth), note: "Live memory traffic, separate from allocated model capacity." },
    { id: "power", label: "SoC power", unit: "W", value: value(power?.current_watts, power?.available), maximum: finite(power?.limit_watts), reference: "Reported power limit", ...stats(power), note: "SoC power as reported by the runtime; not wall-socket power." },
  ];
}

/** Receipt of a cached HTTP response does not make the source sample fresh. */
export function freshness(capability: Capability | null, resources: Resources | null, receivedAt: number | null, failed: boolean, now: number): Freshness {
  if (capability?.state === "static") return "Offline";
  if (!resources || receivedAt === null) return failed ? "Disconnected" : "Connecting";
  if (now - receivedAt >= DISCONNECTED_MS) return "Disconnected";
  const at = Date.parse(resources.sampled_at);
  if (!Number.isFinite(at) || at > now + STALE_MS || now - at > STALE_MS || failed || capability?.state === "stale") return "Stale";
  return capability?.mode === "mock" ? "Demo data" : "Live";
}

export function appendSample(history: Sample[], resources: Resources, now: number): Sample[] {
  const at = Date.parse(resources.sampled_at);
  const retained = history.filter(sample => sample.at >= now - RETENTION_MS);
  if (!Number.isFinite(at) || at > now + STALE_MS || at < now - RETENTION_MS || (retained.length && at <= retained[retained.length - 1].at)) return retained;
  const values = Object.fromEntries(readings(resources).map(metric => [metric.id, metric.value])) as Sample["values"];
  return [...retained, { at, values }].slice(-600);
}

/** Never bridge an unavailable reading or a polling/visibility gap. */
export function chartPath(samples: Sample[], id: MetricId, end: number, windowMs: number, ceiling: number): string {
  let previous: number | null = null;
  return samples.filter(sample => sample.at >= end - windowMs && sample.at <= end).map(sample => {
    const value = sample.values[id];
    if (value === null || !Number.isFinite(value)) { previous = null; return ""; }
    const x = ((sample.at - (end - windowMs)) / windowMs) * 100;
    const y = 100 - Math.min(1, value / Math.max(ceiling, 1)) * 100;
    const command = previous === null || sample.at - previous > 3500 ? "M" : "L";
    previous = sample.at;
    return `${command}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
}

/** These are observed workload-state changes, NOT inference request events. */
export function workloadObservations(previous: Workload[], next: Workload[], at: number): Observation[] {
  return next.flatMap(item => {
    const before = previous.find(old => old.id === item.id);
    if (!before || before.active === item.active) return [];
    return [{ id: `${at}:${item.id}:${item.active}`, at, text: `${item.name}: runtime now reports ${item.active ? "active" : "inactive"}.` }];
  });
}

/** Browser destinations must come from the existing API, never invented ports. */
export function applicationUrl(workload: Workload, origin: string): string | null {
  const raw = workload.external_browser_url || workload.browser_url;
  if (typeof raw !== "string" || !raw) return null;
  try {
    const url = new URL(raw, origin);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    return url.href;
  } catch { return null; }
}

export type Options = {
  view: "observatory" | "classic"; tab: "telemetry" | "applications";
  workload: string; windowMs: number;
  largeReadouts: boolean; charts: boolean; activity: boolean; graphite: boolean;
};
export const DEFAULT_OPTIONS: Options = {
  view: "observatory", tab: "telemetry", workload: "", windowMs: 120_000,
  largeReadouts: true, charts: true, activity: true, graphite: true,
};
export function parseOptions(raw: string | null): Options {
  try {
    const data = JSON.parse(raw || "{}");
    if (!data || typeof data !== "object") return { ...DEFAULT_OPTIONS };
    const result = { ...DEFAULT_OPTIONS };
    if (data.view === "classic") result.view = "classic";
    if (data.tab === "applications") result.tab = "applications";
    if (typeof data.workload === "string") result.workload = data.workload;
    if ([120_000, 300_000, 600_000].includes(data.windowMs)) result.windowMs = data.windowMs;
    for (const key of ["largeReadouts", "charts", "activity", "graphite"] as const) {
      if (typeof data[key] === "boolean") result[key] = data[key];
    }
    return result;
  } catch { return { ...DEFAULT_OPTIONS }; }
}
