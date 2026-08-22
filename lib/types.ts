export type Workload = {
  id: string;
  name: string;
  active: boolean;
  description: string;
  browser_url: string;
  external_browser_url?: string | null;
  model_names: string[];
  intelligence_services: string[];
  expected_cold_load_seconds: number;
};

export type Resources = {
  sampled_at: string;
  memory_bandwidth: { current_gbps: number; maximum_gbps: number };
  tensor_core: { active_percent: number; source: string };
  inference_speed: { tokens_per_second: number };
  soc_power: { current_watts: number; limit_watts: number };
};

export type Capability = { mode: "mock" | "node" | "cloud"; role: "admin" | "guest" };

