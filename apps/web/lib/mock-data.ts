import type { Resources, Workload } from "./types";

export const workloads: Workload[] = [
  { id: "noteai", name: "Doctor NoteAI", active: true, description: "Support clinician–patient consultations and shape private clinical notes with local AI.", browser_url: "#", model_names: ["Whisper Large v3 Turbo", "Pyannote Community-1", "Qwen3 32B"], intelligence_services: [], industry_verticals: ["Healthcare"], expected_cold_load_seconds: 600, model_residency: "warm-shared", idle_retention: "retained" },
  { id: "scribeai", name: "Audio2Text", active: false, description: "Turn recordings into speaker-aware transcripts and polished summaries.", browser_url: "#", model_names: ["Whisper Large v3 Turbo", "Pyannote", "Qwen3 32B"], intelligence_services: [], industry_verticals: ["Healthcare", "Enterprise AI"], expected_cold_load_seconds: 600 },
  { id: "dietplan", name: "DietPlan Edge", active: false, description: "Scan packaged food and retrieve live product intelligence locally.", browser_url: "#", model_names: [], intelligence_services: ["Open Food Facts"], industry_verticals: ["Healthcare"], expected_cold_load_seconds: 180 },
  { id: "rag-legal-auditor", name: "Legal RAG Auditor", active: false, description: "Audit contracts with simulated unquantized and quantized performance telemetry.", browser_url: "http://localhost:8004", model_names: ["Unquantized reference", "Quantized reference"], intelligence_services: ["Local benchmark telemetry"], industry_verticals: ["Legal", "Enterprise AI"], expected_cold_load_seconds: 30 },
  { id: "aml-fraud-agent", name: "AML Fraud Agent", active: false, description: "Screen transactions with simulated throughput and fraud-detection comparisons.", browser_url: "http://localhost:8005", model_names: ["Unquantized reference", "Quantized reference"], intelligence_services: ["Local benchmark telemetry"], industry_verticals: ["Financial Services", "Enterprise AI"], expected_cold_load_seconds: 30 },
  { id: "customer-support-router", name: "Support Router", active: false, description: "Route tickets with simulated TTFT and troubleshooting-quality comparisons.", browser_url: "http://localhost:8006", model_names: ["Unquantized reference", "Quantized reference"], intelligence_services: ["Local benchmark telemetry"], industry_verticals: ["Customer Service", "Enterprise AI"], expected_cold_load_seconds: 30 },
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

