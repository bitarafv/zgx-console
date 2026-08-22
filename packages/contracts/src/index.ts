export type NodeState = "static" | "live-guest" | "live-admin" | "stale";

export type Workload = {
  id: string; name: string; active: boolean; description: string; browser_url: string;
  external_browser_url?: string | null; model_names: string[]; intelligence_services: string[];
  expected_cold_load_seconds: number;
};

export type MetricValue = { available?: boolean; source?: string; average?: number | null; peak?: number | null };
export type AllocatedModelMemory = {
  allocated_mib: number | null; capacity_mib: number | null; utilization_percent: number | null;
  source: string; available: boolean;
};
export type Resources = {
  sampled_at: string;
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
