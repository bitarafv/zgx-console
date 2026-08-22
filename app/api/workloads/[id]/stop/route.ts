import { isAdmin, proxyMutation, runtimeMode } from "@/lib/runtime";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[a-z0-9-]+$/.test(id)) return Response.json({ error: "Invalid workload" }, { status: 400 });
  if (runtimeMode() === "mock") return await isAdmin() ? Response.json({ stopped: id }) : Response.json({ error: "Admin access required" }, { status: 403 });
  return proxyMutation(`/api/workloads/${id}/stop`, {});
}

