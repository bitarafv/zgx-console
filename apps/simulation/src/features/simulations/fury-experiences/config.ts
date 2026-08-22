import type { Demo } from "@/lib/types";

export interface FuryExperienceConfig {
  workspace: string;
  liveLabel: string;
  queue: Array<{ id: string; title: string; detail: string; priority: "Routine" | "Review" | "Priority" }>;
  services: string[];
  outputs: string[];
}

const make = (workspace: string, liveLabel: string, nouns: string[], services: string[], outputs: string[]): FuryExperienceConfig => ({
  workspace, liveLabel, services, outputs,
  queue: nouns.map((title, index) => ({ id: `W-${2400 + index * 17}`, title, detail: index === 0 ? "Awaiting governed review" : index === 1 ? "AI services active" : "Ready for approval", priority: index === 0 ? "Priority" : index === 1 ? "Review" : "Routine" })),
});

export const furyExperienceConfigs: Record<string, FuryExperienceConfig> = {
  "clinical-scribe-operations": make("Clinical documentation operations", "Encounter orchestration", ["Cardiology · Dr. Chen", "Primary care · Dr. Shah", "Orthopedics · Dr. Wilson"], ["Streaming speech", "Speaker separation", "Specialty note model", "Quality policy agent"], ["Draft note", "Evidence-linked transcript", "EHR delivery package"]),
  "radiology-operations-command-center": make("Radiology command center", "Study orchestration", ["CT chest · ED", "MR brain · inpatient", "X-ray chest · outpatient"], ["DICOM intake", "Priority detection", "Segmentation service", "Reporting copilot"], ["Priority worklist", "Finding overlays", "Draft impression"]),
  "risk-intelligence-center": make("Enterprise risk intelligence", "Scenario orchestration", ["Commercial credit portfolio", "Liquidity stress scenario", "Third-party concentration"], ["Portfolio analytics", "Regulatory retrieval", "Reasoning model", "Policy validation"], ["Risk briefing", "Evidence pack", "Approval record"]),
  "claims-operations-center": make("Claims operations", "Claims orchestration", ["Property loss · Northeast", "Auto collision · Midwest", "Workers compensation · West"], ["Document extraction", "Image assessment", "Fraud signal model", "Routing agent"], ["Evidence summary", "Risk signals", "Adjuster decision queue"]),
  "multi-line-vision-operations": make("Plant vision operations", "Multi-stream inspection", ["Line 03 · surface finish", "Line 07 · assembly", "Line 11 · packaging"], ["Video ingestion", "Defect detector", "Vision-language model", "Escalation agent"], ["Anomaly timeline", "Cross-line trend", "Quality case"]),
  "engineering-digital-twin-copilot": make("Engineering review center", "Design orchestration", ["Thermal assembly revision", "Airflow simulation run", "Supplier tolerance review"], ["CAD context service", "Simulation retrieval", "Engineering model", "Standards agent"], ["Design briefing", "Evidence comparison", "Review decision"]),
  "ai-model-factory": make("AI model factory", "Model lifecycle", ["Reasoning model evaluation", "Domain adapter fine-tune", "Production quantization"], ["Training runtime", "Evaluation harness", "Quantization service", "Model registry"], ["Evaluation scorecard", "Model artifact", "Release approval"]),
  "departmental-knowledge-platform": make("Departmental knowledge service", "Knowledge orchestration", ["Policy research workspace", "Product knowledge workspace", "Operations knowledge workspace"], ["Permission-aware retrieval", "Embedding service", "Reranker", "Reasoning model"], ["Cited response", "Evidence bundle", "Audit event"]),
  "multi-agent-operations-center": make("Agent operations center", "Agent orchestration", ["Vendor onboarding workflow", "Quarter-end reporting", "Policy exception review"], ["Planner agent", "Research agent", "Action agent", "Policy guardian"], ["Workflow result", "Approval request", "Audit trace"]),
  "enterprise-research-center": make("Enterprise research center", "Research orchestration", ["Market landscape study", "Technical diligence", "Strategic account briefing"], ["Source ingestion", "Research agents", "Evidence graph", "Synthesis model"], ["Cited briefing", "Evidence graph", "Analyst review"]),
  "intelligence-exploitation-center": make("Intelligence exploitation", "Collection orchestration", ["Mixed-media collection 47", "Foreign-language document set", "Imagery evidence package"], ["OCR and translation", "Vision-language model", "Entity extraction", "Graph correlation"], ["Entity graph", "Evidence dossier", "Analyst queue"]),
  "mission-planning-copilot": make("Mission planning center", "Scenario orchestration", ["Operational scenario Alpha", "Logistics constraint review", "Course-of-action comparison"], ["Source fusion", "Planning agents", "Constraint evaluator", "Policy guardian"], ["Scenario comparison", "Evidence map", "Approval package"]),
};

export function getFuryExperienceConfig(demo: Demo) { return furyExperienceConfigs[demo.slug]; }
