import { describe, expect, it } from "vitest";
import { portfolio } from "./mock-data";
import { runRiskScenario } from "./risk-engine";

describe("risk engine", () => {
  const inputs = { rates: 175, spreads: 220, equity: -25, fx: -12, liquidity: 24 };

  it("returns identical outputs for identical inputs", () => {
    expect(runRiskScenario(inputs)).toEqual(runRiskScenario({ ...inputs }));
  });

  it("preserves baseline values for zero shocks", () => {
    const result = runRiskScenario({ rates: 0, spreads: 0, equity: 0, fx: 0, liquidity: 0 });
    expect(result.loss).toBe(0);
    expect(result.stressedMarketValue).toBe(portfolio.marketValue);
    expect(result.var95).toBe(portfolio.var95);
    expect(result.liquidityCoverage).toBe(portfolio.liquidityCoverage);
  });

  it("produces an internally consistent stressed comparison", () => {
    const result = runRiskScenario(inputs);
    expect(result.stressedMarketValue).toBe(portfolio.marketValue - result.loss * 1_000_000);
    expect(result.var95).toBeGreaterThan(portfolio.var95);
    expect(result.expectedShortfall).toBeGreaterThan(portfolio.expectedShortfall);
    expect(result.contributors[0].loss).toBeGreaterThan(result.contributors[1].loss);
  });
});
