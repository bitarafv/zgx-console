import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dashboard = readFileSync(new URL("../components/NodeDashboard.tsx", import.meta.url), "utf8");
const demo = readFileSync(new URL("../app/demo/aml-fraud-agent/page.tsx", import.meta.url), "utf8");

describe("model-free AML demo", () => {
  it("is always routed from the AML dashboard card", () => {
    expect(dashboard).toContain(`if (item.id === "aml-fraud-agent") return "/demo/aml-fraud-agent"`);
  });

  it("provides the deterministic escalation and review workflow", () => {
    expect(demo).toContain("No AI model · no node connection · browser-only session");
    expect(demo).toContain("Stream structuring demo");
    expect(demo).toContain("STRUCTURING_SUSPECTED");
    expect(demo).toContain("SAR narrative · deterministic template");
    expect(demo).toContain("Approve draft");
    expect(demo).toContain("Mark filed");
    expect(demo).toContain("Reset");
    expect(demo).not.toContain("fetch(");
    expect(demo).not.toContain("/api/");
  });
});
