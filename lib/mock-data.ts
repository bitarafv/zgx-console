import type { Resources, Workload } from "./types";

export const workloads: Workload[] = [
  { id: "noteai", name: "NoteAI", active: true, description: "Capture, transcribe, and shape private notes with a local language model.", browser_url: "#", model_names: ["Qwen3 32B"], intelligence_services: [], expected_cold_load_seconds: 600 },
  { id: "scribeai", name: "ScribeAI", active: false, description: "Turn recordings into speaker-aware transcripts and polished summaries.", browser_url: "#", model_names: ["Whisper Large v3 Turbo", "Pyannote", "Qwen3 32B"], intelligence_services: [], expected_cold_load_seconds: 600 },
  { id: "dietplan", name: "DietPlan Edge", active: false, description: "Scan packaged food and retrieve live product intelligence locally.", browser_url: "#", model_names: [], intelligence_services: ["Open Food Facts"], expected_cold_load_seconds: 180 },
  { id: "qwen-dev", name: "Qwen Development", active: false, description: "Build against an OpenAI-compatible local development API.", browser_url: "#", model_names: ["Qwen3 Coder 30B"], intelligence_services: [], expected_cold_load_seconds: 300 },
];

export function mockResources(): Resources {
  const wave = (Math.sin(Date.now() / 5500) + 1) / 2;
  return {
    sampled_at: new Date().toISOString(),
    memory_bandwidth: { current_gbps: Math.round(38 + wave * 94), maximum_gbps: 273 },
    tensor_core: { active_percent: Math.round(12 + wave * 56), source: "simulation" },
    inference_speed: { tokens_per_second: Number((22 + wave * 17).toFixed(1)) },
    soc_power: { current_watts: Number((32 + wave * 54).toFixed(1)), limit_watts: 140 },
  };
}

