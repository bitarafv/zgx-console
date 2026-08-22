import { portfolio, positions } from "./mock-data";

export interface ScenarioInputs { rates: number; spreads: number; equity: number; fx: number; liquidity: number }
export interface ScenarioResult {
  stressedMarketValue: number;
  var95: number;
  expectedShortfall: number;
  liquidityCoverage: number;
  concentrationUsage: number;
  loss: number;
  contributors: { name: string; loss: number }[];
  assumptions: ScenarioInputs;
}

const round = (value: number) => Math.round(value * 10) / 10;

export function runRiskScenario(inputs: ScenarioInputs): ScenarioResult {
  const ratesLoss = inputs.rates * 0.78;
  const spreadLoss = inputs.spreads * 0.61;
  const equityLoss = Math.abs(inputs.equity) * 8.9;
  const fxLoss = Math.abs(inputs.fx) * 1.7;
  const liquidityLoss = inputs.liquidity * 2.4;
  const loss = round(ratesLoss + spreadLoss + equityLoss + fxLoss + liquidityLoss);
  const contributors = positions.map((position) => ({
    name: position.issuer,
    loss: round((loss * position.contribution) / 63.1),
  })).sort((a, b) => b.loss - a.loss).slice(0, 4);
  return {
    stressedMarketValue: Math.round(portfolio.marketValue - loss * 1_000_000),
    var95: Math.round(portfolio.var95 + (ratesLoss * 0.08 + spreadLoss * 0.12 + equityLoss * 0.09) * 1_000_000),
    expectedShortfall: Math.round(portfolio.expectedShortfall + (ratesLoss * 0.1 + spreadLoss * 0.16 + equityLoss * 0.12) * 1_000_000),
    liquidityCoverage: round(Math.max(70, portfolio.liquidityCoverage - inputs.liquidity * 0.72 - inputs.spreads * 0.015)),
    concentrationUsage: round(portfolio.concentrationUsage + inputs.spreads * 0.012),
    loss,
    contributors,
    assumptions: { ...inputs },
  };
}

export const formatMoney = (value: number) => value >= 1_000_000_000 ? `$${(value / 1_000_000_000).toFixed(2)}bn` : `$${(value / 1_000_000).toFixed(1)}m`;
