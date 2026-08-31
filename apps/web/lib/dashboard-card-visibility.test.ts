import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../components/NodeDashboard.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

describe("dashboard card visibility", () => {
  it("excludes DietPlan from installed application cards", () => {
    expect(source).toContain('workloadItems.filter(item => item.id !== "dietplan")');
    expect(source).toContain("visibleWorkloadItems.flatMap");
    expect(source).toContain("visibleWorkloadItems\n    .filter");
  });

  it("lets telemetry help tooltips escape the metrics panel", () => {
    expect(styles).toMatch(/\.metrics\{[^}]*overflow:visible/);
    expect(styles).not.toMatch(/\.metrics\{[^}]*overflow:hidden/);
  });
});
