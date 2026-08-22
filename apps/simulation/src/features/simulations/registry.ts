import clinicalScribeModule from "./clinical-scribe";
import radiologyAssistantModule from "./radiology-assistant";
import riskAnalystCopilotModule from "./risk-analyst-copilot";
import { furySimulationModules } from "./fury-experiences";
import type { SimulationModule } from "./contracts";
import { requiredSimulationStates } from "./contracts";

// Integration-owned registry. Builders export modules from their owned directory;
// the integrator adds static imports here after review so Next.js can prerender them.
export const simulationModules: SimulationModule[] = [
  clinicalScribeModule,
  radiologyAssistantModule,
  riskAnalystCopilotModule,
  ...furySimulationModules,
];

export function getSimulationModule(platform: SimulationModule["platform"], industrySlug: string, slug: string) {
  return simulationModules.find((module) => module.platform === platform && module.industrySlug === industrySlug && module.slug === slug);
}

export function validateSimulationModules(modules: SimulationModule[] = simulationModules) {
  const slugs = modules.map((module) => `${module.platform}:${module.industrySlug}:${module.slug}`);
  return {
    uniqueSlugs: new Set(slugs).size === slugs.length,
    complete: modules.every((module) => module.validation.supportsReset && requiredSimulationStates.every((state) => module.validation.states.includes(state)) && /^\d{4}-\d{2}-\d{2}$/.test(module.validation.reviewedAt) && Boolean(module.content.competitive) && Boolean(module.content.discussion) && Boolean(module.content.workload)),
  };
}
