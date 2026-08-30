import { describe, expect, it } from "vitest";
import { allowedSivaMethod, canonicalAppMountUrl, rewriteSivaHtml, sivaPath } from "./siva-proxy";

describe("Siva admin proxy", () => {
  it("canonicalizes only exact application mounts and preserves queries", () => {
    expect(canonicalAppMountUrl("https://console.test/admin/siva/apps/aml-fraud-agent?demo=false",["apps","aml-fraud-agent"])).toBe("/admin/siva/apps/aml-fraud-agent/?demo=false");
    expect(canonicalAppMountUrl("https://console.test/admin/siva/apps/aml-fraud-agent/?demo=false",["apps","aml-fraud-agent"])).toBeNull();
    expect(canonicalAppMountUrl("https://console.test/admin/siva/apps/aml-fraud-agent/app.js",["apps","aml-fraud-agent","app.js"])).toBeNull();
    expect(canonicalAppMountUrl("https://console.test/admin/siva/apps/aml-fraud-agent/api/cases",["apps","aml-fraud-agent","api","cases"])).toBeNull();
  });
  it("maps only explicit Siva routes", () => {
    expect(sivaPath()).toBe("/");
    expect(sivaPath(["launch", "pending"])).toBe("/launch/pending");
    expect(sivaPath(["api", "transitions", "abc-123"])).toBe("/api/transitions/abc-123");
    expect(sivaPath(["api", "workloads", "noteai", "stop"])).toBe("/api/workloads/noteai/stop");
    expect(sivaPath(["terminal", "hermes"])).toBe("/terminal/hermes");
    expect(sivaPath(["assets", "xterm.js"])).toBe("/assets/xterm.js");
    expect(sivaPath(["api", "terminals", "hermes", "events"])).toBe("/api/terminals/hermes/events");
    expect(sivaPath(["api", "workloads", "hermes", "download"])).toBe("/api/workloads/hermes/download");
    expect(sivaPath(["apps", "aml-fraud-agent"])).toBe("/apps/aml-fraud-agent");
    expect(sivaPath(["apps", "aml-fraud-agent", "api", "cases", "case-1"])).toBe("/apps/aml-fraud-agent/api/cases/case-1");
    expect(sivaPath(["apps", "aml-fraud-agent", "%2e%2e", "secret"])).toBeNull();
    expect(sivaPath(["terminal", "noteai"])).toBeNull();
    expect(sivaPath(["assets", "unknown.js"])).toBeNull();
    expect(sivaPath(["api", "terminals", "noteai", "events"])).toBeNull();
    expect(sivaPath(["api", "workloads", "..", "stop"])).toBeNull();
    expect(sivaPath(["debug"])).toBeNull();
  });
  it("restricts methods by route", () => {
    expect(allowedSivaMethod("GET", "/api/resources")).toBe(true);
    expect(allowedSivaMethod("POST", "/api/resources")).toBe(false);
    expect(allowedSivaMethod("POST", "/api/transitions")).toBe(true);
    expect(allowedSivaMethod("GET", "/apps/aml-fraud-agent/")).toBe(true);
    expect(allowedSivaMethod("GET", "/apps/aml-fraud-agent/api/cases/case-1")).toBe(true);
    expect(allowedSivaMethod("POST", "/apps/aml-fraud-agent/api/demo")).toBe(true);
    expect(allowedSivaMethod("POST", "/apps/aml-fraud-agent/api/cases/case-1/review")).toBe(true);
    expect(allowedSivaMethod("GET", "/apps/aml-fraud-agent/%2e%2e/secret")).toBe(false);
    expect(allowedSivaMethod("GET", "/terminal/hermes")).toBe(true);
    expect(allowedSivaMethod("GET", "/api/terminals/hermes/events")).toBe(true);
    expect(allowedSivaMethod("POST", "/api/terminals/hermes/sessions")).toBe(true);
    expect(allowedSivaMethod("POST", "/api/terminals/noteai/sessions")).toBe(false);
    expect(allowedSivaMethod("DELETE", "/api/workloads/noteai/stop")).toBe(false);
  });
  it("rewrites root-relative console routes", () => {
    const rewritten = rewriteSivaHtml(`fetch('/api/workloads');window.open('/launch/pending');fetch("/api/policy");actions.innerHTML=\`<a href="\${x.interactive_terminal?.path||x.browser_url}">Open application</a>\``);
    expect(rewritten).toContain("fetch('/admin/siva/api/workloads')");
    expect(rewritten).toContain("window.open('/admin/siva/launch/pending')");
    expect(rewritten).toContain('fetch("/admin/siva/api/policy")');
    expect(rewritten).toContain(`searchParams.set("demo","false")`);
    expect(rewritten).not.toContain('target="_blank" rel="noopener">Open application</a>');
  });
  it("rewrites the Hermes terminal surface under the authenticated proxy", () => {
    const rewritten = rewriteSivaHtml(`<link href="/assets/xterm.css"><script src="/assets/xterm.js"></script><a href="/">Dashboard</a><strong id="filePath">Hermes sandbox</strong><script>filePathLabel.textContent=workspacePath?\`Hermes sandbox / \${workspacePath}\`:'Hermes sandbox';fetch(\`/api/workloads/hermes/files?path=\${path}\`);new EventSource(\`/api/terminals/hermes/events?token=\${token}\`);location.href='/'</script>`);
    expect(rewritten).toContain('href="/admin/siva/assets/xterm.css"');
    expect(rewritten).toContain('src="/admin/siva/assets/xterm.js"');
    expect(rewritten).toContain('href="/admin/siva"');
    expect(rewritten).toContain('/admin/siva/api/workloads/hermes/files?path=');
    expect(rewritten).toContain('/admin/siva/api/terminals/hermes/events?token=');
    expect(rewritten).toContain("location.href='/admin/siva'");
    expect(rewritten).toContain('id="filePath">/opt/data<');
    expect(rewritten).toContain("filePathLabel.textContent=workspacePath?`/opt/data/${workspacePath}`:'/opt/data';");
    expect(rewritten).not.toContain("Hermes sandbox");
  });
  it("filters the inactive BF16 box from NoteAI's default AWQ launch page", () => {
    const rewritten = rewriteSivaHtml("<html><body><main>Loading</main></body></html>", "qwen3-32b-awq");
    expect(rewritten).toContain('wanted="qwen3-32b-awq",hidden="qwen3-32b-bf16"');
    expect(rewritten).toContain("MutationObserver");
    expect(rewriteSivaHtml("<body>Loading</body>")).not.toContain("qwen3-32b-bf16");
  });
  it("filters the comprehensive 120B box from Dossier's default 20B launch page", () => {
    const timeline = "const models=x.model_names?.length?x.model_names:['Static services'];";
    const rewritten = rewriteSivaHtml(`<html><body><script>${timeline}</script></body></html>`, "openai/gpt-oss-20b");
    expect(rewritten).toContain('wanted="openai/gpt-oss-20b",hidden="gpt-oss-120b"');
    expect(rewritten).not.toContain(timeline);
    expect(rewritten).toContain(".filter(name=>clean(name).toLowerCase()!==\"gpt-oss-120b\")");
  });
});
