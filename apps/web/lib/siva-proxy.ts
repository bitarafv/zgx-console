const SAFE_ID = /^[A-Za-z0-9-]+$/;

export function sivaPath(segments: string[] = []): string | null {
  if (segments.length === 0) return "/";
  if (segments.length === 2 && segments[0] === "launch" && SAFE_ID.test(segments[1])) return `/launch/${segments[1]}`;
  if (segments.length === 2 && segments[0] === "api" && ["resources", "workloads", "policy"].includes(segments[1])) return `/api/${segments[1]}`;
  if (segments.length === 2 && segments[0] === "api" && segments[1] === "transitions") return "/api/transitions";
  if (segments.length >= 3 && segments[0] === "api" && segments[1] === "transitions" && SAFE_ID.test(segments[2])) {
    if (segments.length === 3) return `/api/transitions/${segments[2]}`;
    if (segments.length === 4 && ["events", "report"].includes(segments[3])) return `/api/transitions/${segments[2]}/${segments[3]}`;
  }
  if (segments.length === 4 && segments[0] === "api" && segments[1] === "workloads" && SAFE_ID.test(segments[2]) && segments[3] === "stop") return `/api/workloads/${segments[2]}/stop`;
  return null;
}

export function allowedSivaMethod(method: string, path: string): boolean {
  if (method === "GET") return path === "/" || path.startsWith("/launch/") || path === "/api/resources" || path === "/api/workloads" || path === "/api/policy" || path === "/api/transitions" || /^\/api\/transitions\/[A-Za-z0-9-]+(?:\/(?:events|report))?$/.test(path);
  if (method === "POST") return path === "/api/transitions" || /^\/api\/workloads\/[A-Za-z0-9-]+\/stop$/.test(path);
  return false;
}

export function rewriteSivaHtml(source: string): string {
  return source.replace(/(["'])\/api\//g, "$1/admin/siva/api/").replace(/(["'])\/launch\//g, "$1/admin/siva/launch/");
}
