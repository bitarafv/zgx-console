import { MockApp } from "@/components/mock-app";
import type { Demo, Platform } from "@/lib/types";
import { getSimulationModule } from "./registry";

export function SimulationRenderer({ demo, platform, industrySlug }: { demo: Demo; platform: Platform; industrySlug: string }) {
  const simulation = getSimulationModule(platform, industrySlug, demo.slug);
  if (!simulation) return <MockApp demo={demo}/>;
  const Component = simulation.Component;
  return <Component demo={demo} platform={platform}/>;
}
