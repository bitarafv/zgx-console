import { describe, expect, it } from "vitest";
import type { Capability, Resources, Workload } from "./types";
import { appendSample, applicationUrl, chartPath, DEFAULT_OPTIONS, finite, formatValue, freshness, parseOptions, readings, RETENTION_MS, workloadObservations } from "./observatory";
const now = Date.parse("2026-09-11T12:00:00Z");
const capability: Capability = { mode: "node", role: "guest", state: "live-guest" };
function resource(at = now): Resources {
  return { sampled_at: new Date(at).toISOString(),
    memory_bandwidth: { current_gbps: 61, maximum_gbps: 273, average: 50, peak: 70, source: "bandwidth-source" },
    allocated_model_memory: { allocated_mib: 4096, capacity_mib: 131072, utilization_percent: 3.125, source: "allocation-source", available: true },
    tensor_core: { active_percent: 32, source: "tensor-source" },
    inference_speed: { tokens_per_second: 12, average: 10, peak: 15, source: "runtime" },
    soc_power: { current_watts: 70, limit_watts: 140, source: "power-source" },
  };
}
const workload: Workload = { id: "example", name: "Example", description: "Test fixture", active: false, browser_url: null, model_names: ["test-model"], intelligence_services: [], expected_cold_load_seconds: 1 };
describe("metric parity", () => {
  it("preserves all five original metrics, references, sources, averages and peaks", () => {
    const values = readings(resource());
    expect(values.map(value => value.id)).toEqual(["speed", "memory", "tensor", "bandwidth", "power"]);
    expect(values.map(value => value.value)).toEqual([12, 4, 32, 61, 70]);
    expect(values.map(value => value.maximum)).toEqual([15, 128, 100, 273, 140]);
    expect(values[3]).toMatchObject({ average: 50, peak: 70, source: "bandwidth-source" });
  });
  it("distinguishes zero, missing, unavailable and invalid readings", () => {
    const r = resource(); r.inference_speed.tokens_per_second = 0;
    expect(readings(r)[0].value).toBe(0);
    r.inference_speed.available = false;
    expect(readings(r)[0].value).toBeNull();
    expect(readings(null).every(value => value.value === null)).toBe(true);
    expect([finite(NaN), finite(Infinity), finite(-1), finite("12")]).toEqual([null, null, null, null]);
    expect(formatValue(null)).toBe("Unavailable"); expect(formatValue(0)).toBe("0");
  });
  it("keeps the legacy allocation fallback without pretending it is free memory", () => {
    const r = resource(); delete r.allocated_model_memory;
    r.gpu = { mode: "memory", total_mib: 10240, workload_used_mib: 1024 };
    expect(readings(r)[1]).toMatchObject({ value: 1, maximum: 10, source: "nvidia-smi" });
    r.gpu.mode = "unified"; expect(readings(r)[1].value).toBeNull();
  });
  it("does not override explicitly unavailable allocation using the legacy GPU field", () => {
    const r = resource(); r.allocated_model_memory!.available = false;
    r.gpu = { mode: "memory", total_mib: 10240, workload_used_mib: 1024 };
    expect(readings(r)[1].value).toBeNull();
  });
});
describe("freshness", () => {
  it("labels hardware and demonstration data separately", () => {
    expect(freshness(capability, resource(), now, false, now)).toBe("Live");
    expect(freshness({ ...capability, mode: "mock" }, resource(), now, false, now)).toBe("Demo data");
  });
  it("never relabels a cached old source sample as fresh", () => {
    expect(freshness(capability, resource(now - 6000), now, false, now)).toBe("Stale");
    expect(freshness(capability, resource(now + 6000), now, false, now)).toBe("Stale");
  });
  it("distinguishes connecting, stale, disconnected and withdrawn sharing", () => {
    expect(freshness(null, null, null, false, now)).toBe("Connecting");
    expect(freshness(capability, resource(), now, true, now)).toBe("Stale");
    expect(freshness(capability, resource(), now, false, now + 15000)).toBe("Disconnected");
    expect(freshness({ ...capability, state: "static" }, resource(), now, false, now)).toBe("Offline");
  });
  it("treats invalid timestamps and server stale status as stale", () => {
    expect(freshness(capability, { ...resource(), sampled_at: "invalid" }, now, false, now)).toBe("Stale");
    expect(freshness({ ...capability, state: "stale" }, resource(), now, false, now)).toBe("Stale");
  });
});
describe("bounded source-timestamped history", () => {
  it("rejects duplicate and out-of-order samples without mutating history", () => {
    const first = appendSample([], resource(), now);
    expect(appendSample(first, resource(), now)).toHaveLength(1);
    expect(appendSample(first, resource(now - 1000), now)).toHaveLength(1);
    expect(appendSample(first, resource(now + 1000), now + 1000)).toHaveLength(2);
    expect(first).toHaveLength(1);
  });
  it("retains at most 600 samples and at most ten minutes", () => {
    let history = appendSample([], resource(now - 599000), now - 599000);
    for (let i = 1; i <= 650; i++) history = appendSample(history, resource(now - 599000 + i * 1000), now - 599000 + i * 1000);
    expect(history).toHaveLength(600);
    expect(appendSample(history, resource(now + RETENTION_MS + 100000), now + RETENTION_MS + 100000)).toHaveLength(1);
  });
  it("rejects invalid and excessively future timestamps", () => {
    expect(appendSample([], { ...resource(), sampled_at: "invalid" }, now)).toEqual([]);
    expect(appendSample([], resource(now + 6000), now)).toEqual([]);
  });
  it("breaks a chart line across unavailable readings or gaps", () => {
    let history = appendSample([], resource(now - 10000), now);
    const missing = resource(now - 9000); missing.inference_speed.available = false;
    history = appendSample(history, missing, now);
    history = appendSample(history, resource(now - 8000), now);
    history = appendSample(history, resource(now - 7000), now);
    history = appendSample(history, resource(now), now);
    const path = chartPath(history, "speed", now, 120000, 20);
    expect(path.match(/M/g)).toHaveLength(3); expect(path.match(/L/g)).toHaveLength(1);
  });
});
describe("safe application destinations and honest events", () => {
  it("uses provided http(s) and relative destinations only", () => {
    expect(applicationUrl({ ...workload, browser_url: "/example" }, "https://console.example")).toBe("https://console.example/example");
    expect(applicationUrl({ ...workload, browser_url: "http://localhost:9000", external_browser_url: "https://apps.example/a" }, "https://console.example")).toBe("https://apps.example/a");
    for (const url of ["javascript:alert(1)", "data:text/html,test", "https://user:password@example.com"]) expect(applicationUrl({ ...workload, browser_url: url }, "https://console.example")).toBeNull();
    expect(applicationUrl(workload, "https://console.example")).toBeNull();
  });
  it("only records observed changes, not invented initial starts or request stages", () => {
    expect(workloadObservations([], [{ ...workload, active: true }], now)).toEqual([]);
    expect(workloadObservations([workload], [workload], now)).toEqual([]);
    expect(workloadObservations([workload], [{ ...workload, active: true }], now)[0].text).toBe("Example: runtime now reports active.");
  });
});
describe("reversible view preferences", () => {
  it("recovers from malformed or stale storage", () => {
    for (const raw of [null, "broken", "null", "42"]) expect(parseOptions(raw)).toEqual(DEFAULT_OPTIONS);
    expect(parseOptions('{"charts":"false","windowMs":12}')).toEqual(DEFAULT_OPTIONS);
  });
  it("supports Classic and independent feature reversals without erasing other settings", () => {
    const options = parseOptions('{"view":"classic","tab":"applications","charts":false,"activity":false,"windowMs":300000,"workload":"example"}');
    expect(options).toMatchObject({ view: "classic", tab: "applications", charts: false, activity: false, windowMs: 300000, workload: "example", largeReadouts: true, graphite: true });
    expect(DEFAULT_OPTIONS.charts).toBe(true);
  });
});
