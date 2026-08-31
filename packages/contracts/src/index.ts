export type NodeState = "static" | "live-guest" | "live-admin" | "stale";
export type ModelTransition = {
  id?: string; status?: "running" | "ready" | "failed"; phase?: string; progressPercent?: number;
  sourceModel?: string | null; targetModel?: string | null; elapsedMs?: number; estimatedRemainingMs?: number | null;
  loadDurationMs?: number; recovery?: boolean; recoveredModel?: string; retryable?: boolean;
  error?: { reason?: string; detail?: string } | null;
  gpu?: { utilizationPercent?: number | null; memoryUsedMiB?: number | null; memoryFreeMiB?: number | null; memoryTotalMiB?: number | null; temperatureC?: number | null; powerWatts?: number | null };
  containers?: Record<string, string>;
};
export type WorkloadRuntimeStatus = {
  ready?: boolean; model_awake?: boolean; model_name?: string | null; active_model?: string | null;
  models?: string[];
  model_status?: Array<{ id: string; role?: "fast" | "precision" | string; loaded?: boolean; runtime?: string }>;
  model_transition?: ModelTransition | null; containers?: Record<string, string>;
  gpu_compute_allocation_mib?: number | null; active_model_allocation_mib?: number | null;
  gpu?: ModelTransition["gpu"];
  unified_memory?: { usedBytes?: number | null; totalBytes?: number | null; utilizationPercent?: number | null };
  token_telemetry?: { total_tokens_consumed: number; active_inference_seconds?: number | null; average_soc_power_watts?: number | null; cloud_rate_per_million_tokens?: number | null; throughput_tier?: string | null; sampled_at?: string | null };
};

export type SchedulerActivity = { state: "loading" | "running" | "cleaning_up" };

export type Workload = {
  id: string; name: string; active: boolean; description: string; browser_url: string | null;
  open_url?: string | null;
  external_browser_url?: string | null; model_names: string[]; intelligence_services: string[];
  interactive_terminal?: { path: string; auto_open?: boolean; title?: string } | null;
  industry_verticals?: string[];
  expected_cold_load_seconds: number;
  workload_class?: string; policy?: string; shared_services?: string[]; components?: Record<string,string>;
  inference_consumers?: string[]; telegram_allowlist_configured?: boolean; actions?: string[];
  model_residency?: "resident" | "warm-shared" | "unmapped" | "unknown";
  idle_retention?: "retained" | "releasing" | "released" | "unknown";
  runtime_status?: WorkloadRuntimeStatus;
  scheduler_activity?: SchedulerActivity | null;
};

export type MetricValue = { available?: boolean; source?: string; average?: number | null; peak?: number | null };
export type AllocatedModelMemory = {
  allocated_mib: number | null; capacity_mib: number | null; utilization_percent: number | null;
  source: string; available: boolean;
};
export type Resources = {
  sampled_at: string;
  workload_model_memory?: Record<string, AllocatedModelMemory>;
  memory_bandwidth: MetricValue & { current_gbps: number; maximum_gbps: number };
  allocated_model_memory?: AllocatedModelMemory;
  gpu?: { mode: string; total_mib?: number; workload_used_mib?: number; used_percent?: number };
  tensor_core: MetricValue & { active_percent: number };
  inference_speed: MetricValue & { tokens_per_second: number };
  soc_power: MetricValue & { current_watts: number; limit_watts: number };
};
export type Capability = {
  mode: "mock" | "node" | "cloud"; role: "admin" | "guest"; state: NodeState;
};
