import type { Resources, Workload } from "./types";

export const workloads: Workload[] = [
  { id: "noteai", name: "Doctor NoteAI", active: true, description: "Support clinician–patient consultations and shape private clinical notes with local AI.", browser_url: "#", model_names: ["Whisper Large v3 Turbo", "Pyannote Community-1", "Qwen3 32B"], intelligence_services: [], industry_verticals: ["Healthcare"], expected_cold_load_seconds: 600, model_residency: "warm-shared", idle_retention: "retained" },
  { id: "scribeai", name: "Audio2Text", active: false, description: "Turn recordings into speaker-aware transcripts and polished summaries.", browser_url: "#", model_names: ["Whisper Large v3 Turbo", "Pyannote", "Qwen3 32B"], intelligence_services: [], industry_verticals: ["Healthcare", "Enterprise AI"], expected_cold_load_seconds: 600 },
  { id: "dietplan", name: "DietPlan Edge", active: false, description: "Scan packaged food and retrieve live product intelligence locally.", browser_url: "#", model_names: [], intelligence_services: ["Open Food Facts"], industry_verticals: ["Healthcare"], expected_cold_load_seconds: 180 },
  { id: "rag-legal-auditor", name: "Contract & Legal Auditor", active: false, description: "Audit enterprise contracts against corporate policy with clause-aware retrieval, validated citations, and local dual-engine reasoning.", browser_url: "http://localhost:8004", external_browser_url: "https://contract.bncvc.com", model_names: ["nvidia/Nemotron-Mini-4B-Instruct", "nvidia/Llama-3.1-Nemotron-70B-Instruct"], intelligence_services: ["Clause-aware hybrid retrieval", "Citation validation", "Prompt-injection containment"], industry_verticals: ["Legal", "Enterprise AI"], expected_cold_load_seconds: 900 },
  { id: "aml-fraud-agent", name: "Sovereign AML Operations", active: false, description: "Screen transactions locally, escalate suspicious entity graphs, and prepare human-reviewed SAR narratives.", browser_url: "http://localhost:8005", external_browser_url: "https://aml.bncvc.com", open_url: "/apps/aml-fraud-agent/", model_names: ["nvidia/Nemotron-Mini-4B-Instruct", "nvidia/Llama-3.1-Nemotron-70B-Instruct"], intelligence_services: ["Deterministic AML policy", "Entity graph forensics", "Tamper-evident audit chain"], industry_verticals: ["Financial Services", "Enterprise AI"], expected_cold_load_seconds: 900 },
  { id: "customer-support-router", name: "Enterprise Support Router", active: false, description: "Local enterprise ticket triage, account-scoped RAG, and streamed troubleshooting with dedicated Express and Premium engines.", browser_url: "http://localhost:8006", external_browser_url: "https://router.bncvc.com", model_names: ["llama3:70b-instruct-q4_K_M", "llama3:8b-instruct-fp16", "BAAI/bge-large-en-v1.5"], intelligence_services: ["Deterministic SLA routing", "Account-scoped Qdrant retrieval", "Local streamed troubleshooting"], industry_verticals: ["Customer Service", "Enterprise AI"], expected_cold_load_seconds: 900 },
  { id: "qwen-dev", name: "Local LLM and AI Development", active: false, description: "Develop locally with Open WebUI, an OpenAI-compatible model endpoint, and the Qwen Code Visual Studio Code extension.", browser_url: "#", model_names: ["Qwen3 Coder 30B"], intelligence_services: [], industry_verticals: ["Enterprise AI"], expected_cold_load_seconds: 300 },
];

export function mockResources(): Resources {
  const wave = (Math.sin(Date.now() / 5500) + 1) / 2;
  return {
    sampled_at: new Date().toISOString(),
    memory_bandwidth: { current_gbps: Math.round(38 + wave * 94), maximum_gbps: 273, source: "simulation", available: true },
    allocated_model_memory: { allocated_mib: 33456, capacity_mib: 131072, utilization_percent: 25.5, source: "simulation", available: true },
    tensor_core: { active_percent: Math.round(12 + wave * 56), source: "simulation" },
    inference_speed: { tokens_per_second: Number((22 + wave * 17).toFixed(1)) },
    soc_power: { current_watts: Number((32 + wave * 54).toFixed(1)), limit_watts: 140 },
  };
}
