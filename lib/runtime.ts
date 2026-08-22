import { headers } from "next/headers";

export type RuntimeMode = "mock" | "node" | "cloud";

export function runtimeMode(): RuntimeMode {
  const value = process.env.ZGX_RUNTIME_MODE ?? "mock";
  if (value !== "mock" && value !== "node" && value !== "cloud") throw new Error("Invalid ZGX_RUNTIME_MODE");
  return value;
}

export async function isAdmin(): Promise<boolean> {
  const mode = runtimeMode();
  if (mode === "mock") return process.env.ZGX_MOCK_ADMIN === "true";
  if (mode === "node") return true;
  const email = (await headers()).get("cf-access-authenticated-user-email")?.toLowerCase();
  const allowed = (process.env.ZGX_ADMIN_EMAILS ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && allowed.includes(email));
}

const READ_PATHS = new Set(["/api/resources", "/api/workloads", "/api/policy"]);

export async function proxyRead(path: string): Promise<Response> {
  if (!READ_PATHS.has(path)) return Response.json({ error: "Route not allowed" }, { status: 404 });
  return proxy(path, { method: "GET" });
}

export async function proxyMutation(path: string, body: unknown): Promise<Response> {
  if (!await isAdmin()) return Response.json({ error: "Admin access required" }, { status: 403 });
  const allowed = path === "/api/transitions" || /^\/api\/workloads\/[a-z0-9-]+\/stop$/.test(path);
  if (!allowed) return Response.json({ error: "Route not allowed" }, { status: 404 });
  return proxy(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}

async function proxy(path: string, init: RequestInit): Promise<Response> {
  const origin = process.env.ZGX_NODE_ORIGIN ?? "http://127.0.0.1:18000";
  try {
    const upstream = await fetch(new URL(path, origin), { ...init, cache: "no-store", signal: AbortSignal.timeout(8000) });
    const text = await upstream.text();
    return new Response(text, { status: upstream.status, headers: { "content-type": upstream.headers.get("content-type") ?? "application/json", "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "ZGX Node is unavailable" }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}

