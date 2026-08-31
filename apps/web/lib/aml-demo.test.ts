import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dashboard = readFileSync(new URL("../components/NodeDashboard.tsx", import.meta.url), "utf8");
const demo = readFileSync(new URL("../app/demo/aml-fraud-agent/page.tsx", import.meta.url), "utf8");

describe("model-free AML demo", () => {
  it("is always routed from the AML dashboard card", () => {
    expect(dashboard).toContain(`if (item.id === "aml-fraud-agent") return "/demo/aml-fraud-agent"`);
  });

  it("mirrors production while intercepting model actions with booking", () => {
    expect(demo).toContain("INTERACTIVE SANDBOX DEMO");
    expect(demo).toContain('useState<"control"|"case">("control")');
    expect(demo.indexOf("Production Control Room")).toBeLessThan(demo.indexOf("Case Study"));
    expect(demo).toContain("Run Analysis");
    expect(demo).toContain("AI Risk Assessment");
    expect(demo).toContain("AI Explanation");
    expect(demo).toContain("AI Investigation");
    expect(demo).toContain("Model-based Forensics");
    expect(demo).toContain("Generate SAR Draft");
    expect(demo).toContain("Regenerate Narrative");
    expect(demo).toContain("DemoAccessModal");
    expect(demo).toContain('workloadId="aml-fraud-agent"');
    expect(demo).toContain("no inference, model loading, VRAM reservation");
    expect(demo).not.toContain("fetch(");
  });
});
