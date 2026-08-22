import type { SimulationModule } from "../contracts";
import { competitive, discussion, workload } from "./content";
import { RiskAnalystSimulation } from "./simulation";

const riskAnalystCopilot: SimulationModule = {
  platform: "nano",
  slug: "risk-analyst-copilot",
  name: "Risk Analyst Copilot",
  industrySlug: "financial-services",
  version: 1,
  Component: RiskAnalystSimulation,
  content: { discussion, competitive, workload },
  validation: {
    supportsReset: true,
    states: ["initial", "processing", "success", "empty", "error"],
    reviewedAt: "2026-08-18",
  },
};

export default riskAnalystCopilot;
export { riskAnalystCopilot };
