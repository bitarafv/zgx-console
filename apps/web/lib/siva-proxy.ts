const SAFE_ID = /^[A-Za-z0-9-]+$/;
const SAFE_APP_SEGMENT = /^[A-Za-z0-9._~!$&'()*+,;=:@%-]+$/;

function safeAppSegments(segments: string[]): boolean {
  return segments.length >= 2 && segments[0] === "apps" && SAFE_ID.test(segments[1]) && segments.slice(2).every(segment => SAFE_APP_SEGMENT.test(segment) && segment !== "." && segment !== ".." && !segment.toLowerCase().includes("%2e"));
}

function safeAppPath(path: string): boolean {
  const segments = path.split("/");
  if (segments.at(-1) === "") segments.pop();
  return segments[0] === "" && safeAppSegments(segments.slice(1));
}

export function canonicalAppMountUrl(requestUrl: string, segments: string[]): string | null {
  if (segments.length !== 2 || segments[0] !== "apps" || !SAFE_ID.test(segments[1])) return null;
  const url = new URL(requestUrl);
  if (url.pathname.endsWith("/")) return null;
  return `${url.pathname}/${url.search}`;
}

export function sivaPath(segments: string[] = []): string | null {
  if (segments.length === 0) return "/";
  if (safeAppSegments(segments)) return `/${segments.join("/")}`;
  if (segments.length === 2 && segments[0] === "terminal" && segments[1] === "hermes") return "/terminal/hermes";
  if (segments.length === 2 && segments[0] === "assets" && ["xterm.css", "xterm.js", "xterm-addon-fit.js"].includes(segments[1])) return `/assets/${segments[1]}`;
  if (segments.length === 2 && segments[0] === "launch" && SAFE_ID.test(segments[1])) return `/launch/${segments[1]}`;
  if (segments.length === 2 && segments[0] === "api" && ["resources", "workloads", "policy"].includes(segments[1])) return `/api/${segments[1]}`;
  if (segments.length === 2 && segments[0] === "api" && segments[1] === "transitions") return "/api/transitions";
  if (segments.length >= 3 && segments[0] === "api" && segments[1] === "transitions" && SAFE_ID.test(segments[2])) {
    if (segments.length === 3) return `/api/transitions/${segments[2]}`;
    if (segments.length === 4 && ["events", "report"].includes(segments[3])) return `/api/transitions/${segments[2]}/${segments[3]}`;
  }
  if (segments.length === 4 && segments[0] === "api" && segments[1] === "workloads" && SAFE_ID.test(segments[2]) && ["stop", "restart", "emergency-stop", "logs"].includes(segments[3])) return `/api/workloads/${segments[2]}/${segments[3]}`;
  if (segments.length === 4 && segments[0] === "api" && segments[1] === "workloads" && segments[2] === "hermes" && ["files", "download"].includes(segments[3])) return `/api/workloads/hermes/${segments[3]}`;
  if (segments.length === 4 && segments[0] === "api" && segments[1] === "terminals" && segments[2] === "hermes" && ["sessions", "input", "resize", "events", "close"].includes(segments[3])) return `/api/terminals/hermes/${segments[3]}`;
  return null;
}

export function allowedSivaMethod(method: string, path: string): boolean {
  if (method === "GET") return path === "/" || path.startsWith("/launch/") || safeAppPath(path) || path === "/terminal/hermes" || /^\/assets\/(?:xterm\.css|xterm\.js|xterm-addon-fit\.js)$/.test(path) || path === "/api/resources" || path === "/api/workloads" || path === "/api/policy" || path === "/api/transitions" || /^\/api\/workloads\/[A-Za-z0-9-]+\/logs$/.test(path) || /^\/api\/workloads\/hermes\/(?:files|download)$/.test(path) || path === "/api/terminals/hermes/events" || /^\/api\/transitions\/[A-Za-z0-9-]+(?:\/(?:events|report))?$/.test(path);
  if (method === "POST") return path === "/api/transitions" || safeAppPath(path) || /^\/api\/workloads\/[A-Za-z0-9-]+\/(?:stop|restart|emergency-stop)$/.test(path) || /^\/api\/terminals\/hermes\/(?:sessions|input|resize|close)$/.test(path);
  return false;
}

export function rewriteSivaHtml(source: string, visibleModel?: string): string {
  let rewritten = source
    .replace(/(["'`])\/api\//g, "$1/admin/siva/api/")
    .replace(/(["'])\/assets\//g, "$1/admin/siva/assets/")
    .replace(/(["\x27])\/launch\//g, "$1/admin/siva/launch/")
    .replace(/href=(["'])\/\1/g, "href=$1/admin/siva$1")
    .replace(/location\.href=(["'])\/\1/g, "location.href=$1/admin/siva$1")
    .replace('const raw=x.interactive_terminal?.path||x.open_url||x.browser_url;', 'const raw=x.target_workload==="aml-fraud-agent"&&x.external_browser_url?x.external_browser_url:(x.interactive_terminal?.path||x.open_url||x.browser_url);')
    .replace('id="filePath">Hermes sandbox<', 'id="filePath">/opt/data<')
    .replace("filePathLabel.textContent=workspacePath?`Hermes sandbox / ${workspacePath}`:'Hermes sandbox';", "filePathLabel.textContent=workspacePath?`/opt/data/${workspacePath}`:'/opt/data';")
    .replace(/\${x\.interactive_terminal\?\.path\|\|x\.browser_url}/g, "${x.interactive_terminal?.path?'/admin/siva'+x.interactive_terminal.path:(()=>{const u=new URL(x.browser_url);u.searchParams.set(\"demo\",\"false\");return u.toString()})()}");
  const normalizedVisibleModel = visibleModel?.toLowerCase();
  const hiddenModel = normalizedVisibleModel === "qwen/qwen3-32b-awq" || normalizedVisibleModel === "qwen3-32b-awq"
    ? "qwen3-32b-bf16"
    : normalizedVisibleModel === "openai/gpt-oss-20b" || normalizedVisibleModel === "gpt-oss-20b"
      ? "gpt-oss-120b"
      : null;
  if (!visibleModel || !hiddenModel) return rewritten;
  rewritten = rewritten.replace("const models=x.model_names?.length?x.model_names:['Static services'];", `const models=(x.model_names?.length?x.model_names:['Static services']).filter(name=>clean(name).toLowerCase()!==${JSON.stringify(hiddenModel)});`);
  const filter = `<script>(()=>{const wanted=${JSON.stringify(visibleModel)},hidden=${JSON.stringify(hiddenModel)},norm=v=>(v||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");function filter(){for(const leaf of document.querySelectorAll("body *")){if(leaf.children.length||!norm(leaf.textContent).includes(hidden))continue;let box=leaf;while(box.parentElement&&box.parentElement!==document.body){const parent=box.parentElement;if([...parent.children].some(sibling=>sibling!==box&&norm(sibling.textContent).includes(wanted))){box.remove();break}box=parent}}}new MutationObserver(filter).observe(document.documentElement,{childList:true,subtree:true});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",filter):filter()})()</script>`;
  return rewritten.includes("</body>") ? rewritten.replace("</body>", `${filter}</body>`) : `${rewritten}${filter}`;
}
