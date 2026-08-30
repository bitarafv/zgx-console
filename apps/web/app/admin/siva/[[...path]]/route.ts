import { isAdmin } from "@/lib/runtime";
import { allowedSivaMethod, canonicalAppMountUrl, rewriteSivaHtml, sivaPath } from "@/lib/siva-proxy";

export const dynamic = "force-dynamic";
const bridgeOrigin = () => process.env.ZGX_NODE_BRIDGE_ORIGIN ?? "http://127.0.0.1:60372";

async function handler(request: Request, context: { params: Promise<{ path?: string[] }> }) {
  if (!(await isAdmin())) return Response.json({ error: "Admin access required" }, { status: 403 });
  const segments=(await context.params).path ?? [];
  const canonicalMount=canonicalAppMountUrl(request.url,segments);
  if(canonicalMount)return new Response(null,{status:308,headers:{location:canonicalMount,"cache-control":"no-store"}});
  const path = sivaPath(segments);
  if (!path || !allowedSivaMethod(request.method, path)) return Response.json({ error: "Route not allowed" }, { status: 404 });
  const headers: Record<string, string> = { authorization: `Bearer ${process.env.ZGX_BRIDGE_TOKEN ?? ""}`, "x-zgx-admin-secret": process.env.ZGX_ADMIN_BRIDGE_SECRET ?? "" };
  const contentType = request.headers.get("content-type");
  if (contentType) headers["content-type"] = contentType;
  const body = request.method === "POST" ? await request.text() : undefined;
  try {
    const upstreamUrl = new URL(path, bridgeOrigin());
    upstreamUrl.search = new URL(request.url).search;
    const upstream = await fetch(upstreamUrl, { method: request.method, headers, body, cache: "no-store", signal: path.endsWith("/events") ? undefined : AbortSignal.timeout(12_000) });
    const upstreamType = upstream.headers.get("content-type") ?? "application/octet-stream";
    const responseHeaders: Record<string, string> = { "content-type": upstreamType, "cache-control": "no-store", "x-frame-options": "SAMEORIGIN", "content-security-policy": "frame-ancestors 'self'" };
    if (upstreamType.includes("text/html")) {
      const visibleModel = new URL(request.url).searchParams.get("model") ?? undefined;
      return new Response(rewriteSivaHtml(await upstream.text(), visibleModel), { status: upstream.status, headers: responseHeaders });
    }
    const disposition = upstream.headers.get("content-disposition");
    if (disposition) responseHeaders["content-disposition"] = disposition;
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return Response.json({ error: "Siva runtime unavailable" }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
export const GET = handler;
export const POST = handler;
