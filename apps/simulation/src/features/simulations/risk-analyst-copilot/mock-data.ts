export type AlertSeverity = "critical" | "high" | "medium";

export interface RiskAlert {
  id: string;
  name: string;
  severity: AlertSeverity;
  trigger: string;
  riskType: string;
  current: string;
  limit: string;
  change: string;
  counterparties: string[];
}

export interface Position {
  id: string;
  issuer: string;
  assetClass: string;
  sector: string;
  counterparty: string;
  marketValue: number;
  spreadDuration: number;
  liquidityDays: number;
  contribution: number;
}

export const portfolio = {
  name: "Northstar Mutual — General Account Portfolio",
  owner: "Northstar Mutual (fictional organization)",
  marketValue: 4_812_000_000,
  dailyChange: -18_400_000,
  var95: 71_600_000,
  expectedShortfall: 96_200_000,
  liquidityCoverage: 118,
  spreadSensitivity: 3_840_000,
  counterpartyExposure: 392_000_000,
  concentrationUsage: 103.2,
  lastRun: "06:12 ET · 18 Aug 2026",
  freshness: "Positions 05:58 · curves 06:04 · ratings 05:45 ET",
};

export const alerts: RiskAlert[] = [
  { id: "sector-limit", name: "Industrial credit concentration breach", severity: "critical", trigger: "06:14 ET", riskType: "Concentration", current: "12.9%", limit: "12.5%", change: "+0.8 pp", counterparties: ["Asteron Markets", "Northbridge Clearing"] },
  { id: "liquidity", name: "30-day stressed liquidity buffer", severity: "high", trigger: "06:16 ET", riskType: "Liquidity", current: "118%", limit: "≥ 115%", change: "−7 pp", counterparties: ["Redwood Custody"] },
  { id: "counterparty", name: "Asteron exposure nearing threshold", severity: "medium", trigger: "06:18 ET", riskType: "Counterparty", current: "$184m", limit: "$200m", change: "+$23m", counterparties: ["Asteron Markets"] },
];

export const positions: Position[] = [
  { id: "NS-IG-204", issuer: "Kestrel Industrial Finance 5.2", assetClass: "IG corporate", sector: "Industrials", counterparty: "Asteron Markets", marketValue: 246, spreadDuration: 5.8, liquidityDays: 8, contribution: 18.4 },
  { id: "NS-IG-118", issuer: "Meridian Works Senior 4.8", assetClass: "IG corporate", sector: "Industrials", counterparty: "Northbridge Clearing", marketValue: 191, spreadDuration: 6.3, liquidityDays: 9, contribution: 14.1 },
  { id: "NS-SC-073", issuer: "Cobalt Harbor ABS 2024-A", assetClass: "Structured credit", sector: "Structured", counterparty: "Asteron Markets", marketValue: 173, spreadDuration: 3.9, liquidityDays: 17, contribution: 12.7 },
  { id: "NS-GV-291", issuer: "Arbor Republic Note 2031", assetClass: "Government", sector: "Sovereign", counterparty: "Redwood Custody", marketValue: 612, spreadDuration: 4.6, liquidityDays: 2, contribution: 6.2 },
  { id: "NS-EQ-044", issuer: "Lumen Transit Holdings", assetClass: "Public equity", sector: "Transport", counterparty: "Northbridge Clearing", marketValue: 138, spreadDuration: 0, liquidityDays: 3, contribution: 9.6 },
  { id: "NS-ST-012", issuer: "Northstar Short Duration Pool", assetClass: "Cash & short duration", sector: "Liquidity", counterparty: "Redwood Custody", marketValue: 419, spreadDuration: 0.4, liquidityDays: 1, contribution: 2.1 },
];

export const evidence = [
  { id: "POL-CR-04", title: "Internal Concentration Risk Policy", detail: "Section 4.2 · Industrial credit limit 12.5%; analyst escalation required above limit." },
  { id: "RISK-0818", title: "Daily Portfolio Risk Snapshot", detail: "Run 06:12 ET · positions, VaR, expected shortfall, and factor contribution." },
  { id: "CP-0818", title: "Counterparty Exposure Report", detail: "Run 06:08 ET · current and potential exposure by fictional counterparty." },
  { id: "LIQ-STD-02", title: "Liquidity Risk Standard", detail: "Section 3.1 · minimum stressed coverage 115%." },
  { id: "SCN-METH-07", title: "Scenario Methodology Guide", detail: "Illustrative deterministic shock translation and aggregation rules." },
];

export const initialAudit = [
  "06:12 · Overnight risk run completed · System",
  "06:14 · Concentration alert created · Policy engine",
  "06:18 · Alert routed to Morning Review queue · System",
];

export const scenarioPresets = {
  Baseline: { rates: 0, spreads: 0, equity: 0, fx: 0, liquidity: 0 },
  "Moderate slowdown": { rates: 50, spreads: 90, equity: -8, fx: -3, liquidity: 6 },
  "Severe credit stress": { rates: 75, spreads: 300, equity: -18, fx: -7, liquidity: 18 },
  "Rates shock": { rates: 250, spreads: 60, equity: -6, fx: 4, liquidity: 8 },
  "Combined market stress": { rates: 175, spreads: 220, equity: -25, fx: -12, liquidity: 24 },
} as const;

export const initialMemo = `Draft for analyst and risk-committee review — simulated content

Executive summary
Northstar Mutual's fictional General Account Portfolio exceeded its internal industrial credit concentration limit in the overnight simulated risk run.

Alert description
Industrial credit concentration measured 12.9% against a 12.5% policy limit, an increase of 0.8 percentage points from the prior run.

Portfolio impact
To be populated from the selected stress scenario.

Primary risk drivers
Kestrel Industrial Finance 5.2 and Meridian Works Senior 4.8 are the largest displayed contributors.

Scenario assumptions
To be populated from the selected stress scenario.

Stress-test results
To be populated from the selected stress scenario.

Policy and limit context
Internal Concentration Risk Policy §4.2 requires analyst escalation and human review. The copilot cannot approve, waive, or close the breach.

Data-quality notes
One structured-credit liquidity classification is pending validation.

Analyst considerations
Validate position classifications and counterparty allocation before committee review. This is decision support, not financial advice.

Proposed next steps
Confirm source data; document analyst disposition; review the selected scenario; route the draft for required human approvals.

Required approvals
Portfolio Risk Lead and Chief Risk Officer (simulated workflow; no system is connected).`;
