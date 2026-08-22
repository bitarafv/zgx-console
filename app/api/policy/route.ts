import { proxyRead, runtimeMode } from "@/lib/runtime";

export async function GET() {
  return runtimeMode() === "mock" ? Response.json({ maximum_active_workloads: 1, preserve_shared_models_on_switch: true }) : proxyRead("/api/policy");
}

