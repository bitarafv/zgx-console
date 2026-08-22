import type { SimulationModule } from "../contracts";
import { ClinicalScribeSimulation } from "./simulation";
import { competitive, discussion, workload } from "./content";

const clinicalScribeModule: SimulationModule = {
  platform: "nano",
  slug: "clinical-scribe",
  name: "Clinical Scribe",
  industrySlug: "healthcare",
  version: 1,
  Component: ClinicalScribeSimulation,
  content: { competitive, discussion, workload },
  validation: { supportsReset: true, states: ["initial", "processing", "success", "empty", "error"], reviewedAt: "2026-08-18" },
};

export default clinicalScribeModule;
export { clinicalScribeModule };
