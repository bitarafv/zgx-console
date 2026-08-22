import { isAdmin, proxyMutation, runtimeMode } from "@/lib/runtime";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.target_workload !== "string") return Response.json({ error: "Invalid workload" }, { status: 400 });
  if (runtimeMode() === "mock") return await isAdmin() ? Response.json({ transition_id: `mock-${Date.now()}` }, { status: 202 }) : Response.json({ error: "Admin access required" }, { status: 403 });
  return proxyMutation("/api/transitions", { target_workload: body.target_workload });
}

