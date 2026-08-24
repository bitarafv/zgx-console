import { describe, expect, it } from "vitest";
import { consoleHash, normalizeSimulationPath, parseConsoleHash } from "./navigation";

describe("console navigation URLs", () => {
  it("gives every top-level tab a stable URL", () => {
    expect(consoleHash("simulation")).toBe("#demo-display");
    expect(consoleHash("node")).toBe("#mvp-dashboard");
    expect(consoleHash("insights")).toBe("#enterprise-ai-insights");
    expect(consoleHash("tco")).toBe("#tco-calculator");
  });
  it("round-trips Demo Display routes", () => {
    const hash = consoleHash("simulation", "/fury/healthcare");
    expect(hash).toBe("#demo-display=/fury/healthcare");
    expect(parseConsoleHash(hash)).toEqual({ tab: "simulation", simulationPath: "/fury/healthcare" });
  });
  it("accepts legacy hashes and rejects unsafe iframe paths", () => {
    expect(parseConsoleHash("#node").tab).toBe("node");
    expect(normalizeSimulationPath("//outside.example")).toBe("/");
    expect(normalizeSimulationPath("/../admin")).toBe("/");
  });
});
