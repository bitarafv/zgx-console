import { mockResources } from "@/lib/mock-data";
import { proxyRead, runtimeMode } from "@/lib/runtime";

export async function GET() {
  return runtimeMode() === "mock" ? Response.json(mockResources(), { headers: { "cache-control": "no-store" } }) : proxyRead("/api/resources");
}

