import type { Workload } from "./types";

export const DEFAULT_ELECTRICITY_RATE = validDefault(process.env.NEXT_PUBLIC_DEFAULT_ELECTRICITY_RATE, 0.15);
export const DEFAULT_SOC_POWER_WATTS = validDefault(process.env.NEXT_PUBLIC_DEFAULT_SOC_POWER_WATTS, 35);

export type BlendedCloudRate = { inputPercent: number; inputRate: number; outputPercent: number; outputRate: number; rationale: string };

export const BLENDED_CLOUD_RATES: Record<string, BlendedCloudRate> = {
  "aml-fraud-agent": { inputPercent: 80, inputRate: 2.5, outputPercent: 20, outputRate: 10, rationale: "Financial fraud detection ingests heavy input contexts (transaction logs and historical telemetry) relative to concise classification and risk score outputs." },
  "rag-legal-auditor": { inputPercent: 90, inputRate: 3, outputPercent: 10, outputRate: 15, rationale: "Contract scanning requires loading massive document contexts into high-tier frontier models while outputting short compliance findings and citations." },
  "customer-support-router": { inputPercent: 85, inputRate: 0.15, outputPercent: 15, outputRate: 0.6, rationale: "High-volume customer support routing runs on lightweight, low-cost classifier models handling brief user tickets and short destination tags." },
  dietplan: { inputPercent: 70, inputRate: 0.3, outputPercent: 30, outputRate: 1.2, rationale: "Extracting barcode data and nutrition labels combines vision input tokens with structured dietary summary outputs." },
  scribeai: { inputPercent: 85, inputRate: 2.5, outputPercent: 15, outputRate: 10, rationale: "Audio transcription and speaker diarization pipelines feed long transcript text into summary formatting models." },
  noteai: { inputPercent: 75, inputRate: 3, outputPercent: 25, outputRate: 15, rationale: "Clinical consultation transcripts require privacy-compliant frontier models and dense structured medical note generation." },
  "qwen-dev": { inputPercent: 65, inputRate: 2.5, outputPercent: 35, outputRate: 12, rationale: "Coding agents and IDE integrations ingest multi-file repository contexts while writing significant blocks of code outputs." },
  dossierai: { inputPercent: 88, inputRate: 5, outputPercent: 12, outputRate: 20, rationale: "High-recall literature research consumes large multi-document PDF banks to construct concise synthesis dossiers using top-tier frontier models." },
  hermes: { inputPercent: 70, inputRate: 2.5, outputPercent: 30, outputRate: 10, rationale: "Autonomous agent execution loops and tool-calling context windows generate moderate output token volumes over long conversational sessions." },
};

function validDefault(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function blendedRate(config: BlendedCloudRate) {
  const weightedRate = (config.inputPercent / 100 * config.inputRate) + (config.outputPercent / 100 * config.outputRate);
  return Math.round((weightedRate + 1e-9) * 100) / 100;
}

export function workloadTokenSavings(workload: Workload) {
  const telemetry = workload.runtime_status?.token_telemetry;
  const rateConfig = BLENDED_CLOUD_RATES[workload.id];
  if (!telemetry || !rateConfig || !Number.isFinite(telemetry.total_tokens_consumed)) return null;
  const totalTokens = Math.max(0, telemetry.total_tokens_consumed);
  const ratePerMillion = blendedRate(rateConfig);
  const grossSavings = totalTokens / 1_000_000 * ratePerMillion;
  const hasRuntime = Number.isFinite(telemetry.active_inference_seconds) && Number(telemetry.active_inference_seconds) >= 0;
  const activeSeconds = hasRuntime ? Number(telemetry.active_inference_seconds) : null;
  const observedWatts = Number(telemetry.average_soc_power_watts);
  const averageWatts = Number.isFinite(observedWatts) && observedWatts > 0 ? observedWatts : DEFAULT_SOC_POWER_WATTS;
  const usedPowerFallback = !(Number.isFinite(observedWatts) && observedWatts > 0);
  const powerCost = activeSeconds == null ? null : averageWatts / 1000 * (activeSeconds / 3600) * DEFAULT_ELECTRICITY_RATE;
  const netSavings = powerCost == null ? null : grossSavings - powerCost;
  return { totalTokens, ratePerMillion, rateConfig, grossSavings, activeSeconds, averageWatts, usedPowerFallback, powerCost, netSavings };
}
