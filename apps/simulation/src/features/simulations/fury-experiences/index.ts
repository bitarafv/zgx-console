import { platformIndustries } from "@/data/catalog";
import { getCompetitiveLandscape, getWorkloadStack } from "@/data/technology";
import type { SimulationModule } from "../contracts";
import { FuryOperationsSimulation } from "./simulation";

export const furySimulationModules: SimulationModule[] = platformIndustries.fury.flatMap((industry) => industry.demos.map((demo) => ({
  platform: "fury" as const,
  slug: demo.slug,
  name: demo.name,
  industrySlug: industry.slug,
  version: 1 as const,
  Component: FuryOperationsSimulation,
  content: {
    competitive: getCompetitiveLandscape(demo.slug, demo.archetype),
    workload: getWorkloadStack(demo.archetype),
    discussion: { personas: demo.personas, questions: demo.questions, painPoints: demo.painPoints, objections: demo.objections, outcomes: demo.outcomes, nextStep: "Validate the departmental workflow with representative synthetic data and measured service-level objectives." },
  },
  validation: { supportsReset: true as const, states: ["initial", "processing", "success", "empty", "error"], reviewedAt: "2026-08-18" },
})));
