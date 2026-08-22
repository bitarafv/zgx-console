import { workloads } from "@/lib/mock-data";
import { proxyRead, runtimeMode } from "@/lib/runtime";

export async function GET() {
  return runtimeMode() === "mock" ? Response.json(workloads, { headers: { "cache-control": "no-store" } }) : proxyRead("/api/workloads");
}

