import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("../app/workload-card-layout.css", import.meta.url), "utf8");

describe("workload card layout", () => {
  it("keeps VRAM telemetry in normal document flow", () => {
    expect(css).toContain("position:static!important");
    expect(css).toContain("height:auto!important");
    expect(css).toContain("overflow-wrap:anywhere");
    expect(css).not.toContain("height:82px");
  });

  it("separates content and actions responsively", () => {
    expect(css).toContain("grid-template-columns:minmax(0,1fr) auto");
    expect(css).toContain("@media(max-width:760px)");
    expect(css).toContain("grid-template-columns:1fr");
  });
});
