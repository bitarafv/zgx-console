import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../components/NodeDashboard.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

describe("Doctor NoteAI model card", () => {
  it("tags both generation models from health-checked runtime state", () => {
    expect(source).toContain('name === "Qwen/Qwen3-32B-AWQ"');
    expect(source).toContain('name === "Qwen/Qwen3-32B-BF16"');
    expect(source).toContain("item.runtime_status?.ready");
    expect(source).toContain('active ? "Active" : "non-Active"');
  });

  it("does not render a standalone ready-state Active Model panel", () => {
    expect(source).not.toContain("<small>Active model</small>");
    expect(source).toContain("if (!running && !transition?.error?.reason) return null");
  });

  it("uses model-only allocation against 121.6 GiB unified memory", () => {
    expect(source).toContain("active_model_allocation_mib");
    expect(source).toContain("const capacityGiB = 121.6");
    expect(source).toContain("% of 121.6 GiB Unified Memory");
    expect(source).not.toContain("workload-memory-details");
  });

  it("shows Allocated Model VRAM immediately while any workload launches", () => {
    expect(source).toContain('[item.id]: "launching"');
    expect(source).toContain("<LoadingModelMemoryMetric progress={loadingProgress}/>");
    expect(source).toContain('aria-busy="true"');
    expect(source).toContain('"Starting model load…"');
  });

  it("disables app opening in Guest View", () => {
    expect(source).toContain('item.active && usableEndpoint(item.browser_url) && (admin');
    expect(source).toContain('<button type="button" className="workload-open" disabled title="Admin access required">Open the app</button>');
  });

  it("keeps the VRAM help control as a small transparent question mark", () => {
    expect(styles).toContain(".workloads .workload-memory button.metric-help{all:unset;position:relative;display:grid;place-items:center;width:20px;height:20px");
    expect(styles).toContain(".workload-memory .meter{margin-top:14px}");
  });
});
