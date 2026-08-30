import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { Workload } from "./types";
import { BLENDED_CLOUD_RATES, DEFAULT_ELECTRICITY_RATE, DEFAULT_SOC_POWER_WATTS, blendedRate, workloadTokenSavings } from "./token-savings";

function workload(id: string, totalTokens = 1_000_000, activeSeconds: number | null = 3600, averageWatts: number | null = 100): Workload {
  return { id, name: "App", active: true, description: "", browser_url: null, model_names: [], intelligence_services: [], expected_cold_load_seconds: 1, runtime_status: { token_telemetry: { total_tokens_consumed: totalTokens, active_inference_seconds: activeSeconds, average_soc_power_watts: averageWatts } } };
}

describe("workload token savings", () => {
  it.each([
    ["aml-fraud-agent", 4], ["rag-legal-auditor", 4.2], ["customer-support-router", 0.22],
    ["dietplan", 0.57], ["scribeai", 3.63], ["noteai", 6], ["qwen-dev", 5.83],
    ["dossierai", 6.8], ["hermes", 4.75],
  ])("computes the configured blended rate for %s", (id, expected) => {
    expect(blendedRate(BLENDED_CLOUD_RATES[id])).toBe(expected);
  });

  it("subtracts local power from gross savings", () => {
    const result = workloadTokenSavings(workload("hermes", 1_000_000, 7200, 50))!;
    expect(result.grossSavings).toBe(4.75);
    expect(result.powerCost).toBeCloseTo(0.015);
    expect(result.netSavings).toBeCloseTo(4.735);
  });

  it("uses the 35 W fallback when live average power is unavailable", () => {
    const result = workloadTokenSavings(workload("hermes", 1_000_000, 1800, 0))!;
    expect(DEFAULT_SOC_POWER_WATTS).toBe(35);
    expect(DEFAULT_ELECTRICITY_RATE).toBe(0.15);
    expect(result.usedPowerFallback).toBe(true);
    expect(result.powerCost).toBeCloseTo(0.002625);
  });

  it("handles zero runtime and permits negative net savings", () => {
    expect(workloadTokenSavings(workload("hermes", 1_000_000, 0, 100))?.powerCost).toBe(0);
    const negative = workloadTokenSavings(workload("customer-support-router", 0, 3600, 140))!;
    expect(negative.netSavings).toBeCloseTo(-0.021);
  });

  it("does not invent net savings without runtime telemetry", () => {
    const result = workloadTokenSavings(workload("hermes", 1_000_000, null, null))!;
    expect(result.grossSavings).toBe(4.75);
    expect(result.powerCost).toBeNull();
    expect(result.netSavings).toBeNull();
  });

  it("does not invent savings without token telemetry or a configured blend", () => {
    expect(workloadTokenSavings({ ...workload("hermes"), runtime_status: undefined })).toBeNull();
    expect(workloadTokenSavings(workload("unknown"))).toBeNull();
  });
  it("renders the net-savings tooltip and dashboard disclosure", () => {
    const meter = readFileSync(new URL("../components/TokenSavingsMeter.tsx", import.meta.url), "utf8");
    const dashboard = readFileSync(new URL("../components/NodeDashboard.tsx", import.meta.url), "utf8");
    expect(meter).toContain("Net Token Savings:");
    expect(meter).toContain("Gross Savings:");
    expect(meter).toContain("Power Offset Calculation:");
    expect(meter).toContain("Active runtime and power telemetry unavailable");
    expect(dashboard).toContain("* Electricity: $0.15/kWh · Period: 3 years · Rates are configurable assumptions dated April 2026.");
  });
});
