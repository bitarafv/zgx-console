import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../components/NodeDashboard.tsx", import.meta.url), "utf8");

describe("dashboard browser network access", () => {
  it("does not probe benchmark services on the visitor's device", () => {
    expect(source).not.toContain("http://localhost");
    expect(source).not.toContain("/api/metrics");
    expect(source).not.toMatch(/\b800[456]\b/);
  });

  it("does not show stale simulated benchmarks on live workload cards", () => {
    expect(source).not.toContain("const BENCHMARKS");
    expect(source).not.toContain('aria-label="Simulated model benchmark comparison"');
  });

  it("reflects live AML model readiness on its model chips", () => {
    expect(source).toContain('const amlModel = item.id === "aml-fraud-agent"');
    expect(source).toContain("item.runtime_status?.ready && loaded.some");
    expect(source).not.toContain('item.runtime_status?.ready ? "READY"');
    expect(source).toContain("item.intelligence_services.includes(value)");
    expect(source).toContain("item.active && item.runtime_status?.ready");
  });

  it("shows exact legal model roles from live Siva status", () => {
    expect(source).toContain('item.id === "rag-legal-auditor"');
    expect(source).toContain('status?.role === "fast" ? "Fast"');
    expect(source).toContain('status?.role === "precision" ? "Precision"');
  });

  it("leaves verified-success auto-open to the launch page exactly once", () => {
    expect(source).toContain("progressTab.location.assign(progressUrl)");
    expect(source).not.toContain("progressTab.location.assign(destination)");
  });
  it("keeps browser state authoritative and stable across polling failures", () => {
    expect(source).not.toContain("@/lib/mock-data");
    expect(source).toContain("useState<Resources | null>(null)");
    expect(source).toContain("useState<Workload[] | null>(null)");
    expect(source).toContain("setWorkloadError(true)");
    expect(source).toContain("Showing the last successful update");
    expect(source).toContain("Node unavailable");
  });

  it("serializes polling and cancels obsolete dashboard requests", () => {
    expect(source).not.toContain("window.setInterval");
    expect(source).toContain("let inFlight = false");
    expect(source).toContain("window.setTimeout(run");
    expect(source).toContain("new AbortController()");
    expect(source).toContain("controller.abort()");
    expect(source).toContain("if (signal.aborted) return");
  });
});
