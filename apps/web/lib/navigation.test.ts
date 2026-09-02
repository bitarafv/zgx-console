import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { consoleHash, normalizeSimulationPath, parseConsoleHash } from "./navigation";
const consoleSource = readFileSync(new URL("../components/ConsoleShell.tsx", import.meta.url), "utf8");
const frameSource = readFileSync(new URL("../components/SimulationFrame.tsx", import.meta.url), "utf8");
const experienceProviderSource = readFileSync(new URL("../../simulation/src/components/app-provider.tsx", import.meta.url), "utf8");

describe("console navigation URLs", () => {
  it("gives every top-level tab a stable URL", () => {
    expect(consoleHash("simulation")).toBe("#experiences");
    expect(consoleHash("node")).toBe("#mvp-dashboard");
    expect(consoleHash("insights")).toBe("#enterprise-ai-insights");
    expect(consoleHash("tco")).toBe("#tco-calculator");
  });
  it("round-trips Experiences routes", () => {
    const hash = consoleHash("simulation", "/fury/healthcare");
    expect(hash).toBe("#experiences=/fury/healthcare");
    expect(parseConsoleHash(hash)).toEqual({ tab: "simulation", simulationPath: "/fury/healthcare" });
    expect(parseConsoleHash("#demo-display=/nano/healthcare")).toEqual({ tab: "simulation", simulationPath: "/nano/healthcare" });
    expect(parseConsoleHash("#demo-display")).toEqual({ tab: "simulation", simulationPath: "/" });
  });
  it("accepts legacy hashes and rejects unsafe iframe paths", () => {
    expect(parseConsoleHash("#node").tab).toBe("node");
    expect(normalizeSimulationPath("//outside.example")).toBe("/");
    expect(normalizeSimulationPath("/../admin")).toBe("/");
  });
  it("keeps Experiences independent from booking", () => {
    expect(consoleSource).not.toContain("DemoAccessModal");
    expect(consoleSource).not.toContain("request-production-access");
    expect(frameSource).not.toContain("request-production-access");
    expect(experienceProviderSource).not.toContain("request-production-access");
    expect(experienceProviderSource).not.toContain("data-ai-trigger");
  });
});
