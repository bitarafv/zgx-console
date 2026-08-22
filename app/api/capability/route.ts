import { isAdmin, runtimeMode } from "@/lib/runtime";

export async function GET() {
  return Response.json({ mode: runtimeMode(), role: await isAdmin() ? "admin" : "guest" }, { headers: { "cache-control": "no-store" } });
}

