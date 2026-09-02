import { isAdmin, proxyRead, runtimeMode } from "@/lib/runtime";
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[a-z0-9-]+$/.test(id)) return Response.json({ error: "Invalid workload" }, { status: 400 });
  if (!await isAdmin()) return Response.json({ error: "Admin access required" }, { status: 403 });
  if (runtimeMode() === "mock") return Response.json({ workload: id, logs: "Mock workload logs" });
  return proxyRead(`/api/workloads/${id}/logs`, true);
}
