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
    expect(source).toContain("<LoadingModelMemoryMetric progress={loadingProgress} value={workloadMemory}/>");
    expect(source).toContain('aria-busy="true"');
    expect(source).toContain('"Starting model load…"');
    expect(source).toContain("resources?.workload_model_memory?.[item.id]");
    expect(source).toContain("current.toFixed(1)");
    expect(source).toContain("item.active && item.runtime_status?.ready !== true");
  });

  it("does not offer production access booking in Guest View cards", () => {
    expect(source).toContain('workloadOpenControl(item, admin)');
    expect(source).not.toContain('setBookingWorkload');
    expect(source).not.toContain('Request production access');
  });

  it("keeps the VRAM help control as a small transparent question mark", () => {
    expect(styles).toContain(".workloads .workload-memory button.metric-help{all:unset;position:relative;display:grid;place-items:center;width:20px;height:20px");
    expect(styles).toContain(".workload-memory .meter{margin-top:14px}");
  });
  it("launches Dossier's default 20B model and preserves its configured demo path", () => {
    expect(source).toContain('item.id === "dossierai" ? "openai/gpt-oss-20b"');
    expect(source).toContain('target_workload: item.id');
    expect(source).toContain('target_models: [launchModel]');
    expect(source).not.toContain("target_model: launchModel");
    expect(source).toContain("item.expected_cold_load_seconds + 120");
    expect(source).not.toContain('url.pathname = "/"');
    expect(source).toContain("return demoModeUrl(configured)");
  });

});
