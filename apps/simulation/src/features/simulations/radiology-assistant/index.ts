import type { SimulationModule } from "../contracts";
import { radiologyContent } from "./content";
import { RadiologyAssistantSimulation } from "./simulation";

const radiologyAssistantModule: SimulationModule = {
  platform: "nano",
  slug: "radiology-assistant",
  name: "Radiology Assistant",
  industrySlug: "healthcare",
  version: 1,
  Component: RadiologyAssistantSimulation,
  content: radiologyContent,
  validation: { supportsReset: true, states: ["initial", "processing", "success", "empty", "error"], reviewedAt: "2026-08-18" },
};

export default radiologyAssistantModule;
export { radiologyAssistantModule };
