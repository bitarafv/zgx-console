import { describe, expect, it } from "vitest";
import type { SimulationModule } from "./contracts";
import { requiredSimulationStates } from "./contracts";
import { validateSimulationModules } from "./registry";
import { simulationModules } from "./registry";

describe("simulation registry contract", () => {
  it("accepts the empty migration registry while fallback modules remain active", () => {
    expect(validateSimulationModules()).toEqual({ uniqueSlugs: true, complete: true });
  });

  it("detects duplicate module slugs", () => {
    const minimal = { platform: "nano", industrySlug: "healthcare", slug: "duplicate", validation: { supportsReset: true, states: requiredSimulationStates, reviewedAt: "2026-08-18" }, content: { competitive: {}, discussion: {}, workload: {} } } as unknown as SimulationModule;
    expect(validateSimulationModules([minimal, minimal]).uniqueSlugs).toBe(false);
  });

  it("registers Fury modules independently from Nano modules", () => {
    const keys = simulationModules.map((module) => `${module.platform}:${module.industrySlug}:${module.slug}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(simulationModules.filter((module) => module.platform === "fury").length).toBeGreaterThanOrEqual(10);
  });
});
