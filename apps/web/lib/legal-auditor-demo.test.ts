import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.join(process.cwd(), "app/demo/rag-legal-auditor");
const page = fs.readFileSync(path.join(root, "page.tsx"), "utf8");
const styles = fs.readFileSync(path.join(root, "styles.module.css"), "utf8");
const dashboard = fs.readFileSync(path.join(process.cwd(), "components/NodeDashboard.tsx"), "utf8");

describe("instant model-free Contract & Legal Auditor demo", () => {
  it("is always routed from the dashboard independently of workload state", () => {
    expect(dashboard).toContain('if (item.id === "rag-legal-auditor") return "/demo/rag-legal-auditor"');
    expect(dashboard.indexOf("const demoUrl = workloadDemoUrl(item)")).toBeLessThan(dashboard.indexOf("const openControl = workloadOpenControl(item, admin)"));
    expect(dashboard).toContain("{demoUrl");
    expect(dashboard).not.toMatch(/item\.active\s*&&\s*demoUrl|admin\s*&&\s*demoUrl/);
  });

  it("shows persistent fictional, offline, and no-inference banners", () => {
    expect(page).toContain("DEMO · FICTIONAL DATA");
    expect(page).toContain("MODELS OFFLINE · NO PRODUCTION INFERENCE");
    expect(page).toContain("NO UPLOADS OR PRODUCTION CALLS");
    expect(styles).toMatch(/\.demoBanner\{position:sticky/);
  });

  it("guards every production-dependent action with the booking modal", () => {
    for (const label of [
      "Run contract audit",
      "Upload documents",
      "Export structured JSON",
      "Generate audit report",
      "Ask with citations",
      "Compare live models",
      "Access live models",
    ]) expect(page).toContain(`onClick={book}>${label}`);
    expect(page.match(/data-ai-action/g)).toHaveLength(7);
    expect(page).toContain("DemoAccessModal");
    expect(page).toContain('workloadId="rag-legal-auditor"');
  });

  it("keeps precomputed navigation interactive without booking", () => {
    expect(page).toContain("data-demo-browse");
    expect(page).toContain('onClick={() => setTab(value)}');
    expect(page).toContain('onClick={() => setTab("evidence")}');
    expect(page).toContain("DISCREPANCY MATRIX");
    expect(page).toContain("Security Policy §1.1");
  });

  it("contains no production, model, upload, or lifecycle calls", () => {
    expect(page).not.toMatch(/fetch\(|chat\/completions|\/api\/audit|\/api\/query|\/api\/upload|\/api\/export|\/api\/report|8503|8504|launch\(|stop\(/);
    expect(page).toContain("does not establish legal reliability");
  });
});
