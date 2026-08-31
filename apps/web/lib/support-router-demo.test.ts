import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dashboard = readFileSync(new URL("../components/NodeDashboard.tsx", import.meta.url), "utf8");
const demo = readFileSync(new URL("../app/demo/customer-support-router/page.tsx", import.meta.url), "utf8");
const mockData = readFileSync(new URL("./mock-data.ts", import.meta.url), "utf8");

describe("customer support router demo", () => {
  it("uses production metadata and the external hostname in mock mode", () => {
    const entry = mockData.split('{ id: "customer-support-router"', 2)[1]?.split("},", 1)[0] ?? "";
    expect(entry).toContain('name: "Enterprise Support Router"');
    expect(entry).toContain('external_browser_url: "https://router.bncvc.com"');
    expect(entry).toContain('"llama3:70b-instruct-q4_K_M"');
    expect(entry).toContain('"llama3:8b-instruct-fp16"');
    expect(entry).toContain('"BAAI/bge-large-en-v1.5"');
    expect(entry.toLowerCase()).not.toContain("simulat");
  });

  it("routes See a demo to an always-available dashboard page", () => {
    expect(dashboard).toContain('if (item.id === "customer-support-router") return "/demo/customer-support-router"');
    expect(dashboard).not.toContain(`"customer-support-router": { unquantized:`);
  });

  it("uses the production model names without inference calls", () => {
    expect(demo).toContain("Llama 3 70B Instruct");
    expect(demo).toContain("Llama 3 8B Instruct");
    expect(demo).toContain("BGE Large EN v1.5");
    expect(demo).not.toContain("fetch(");
  });

  it("gates every AI control behind the shared booking modal", () => {
    expect(demo.match(/onClick={requestLiveAccess}/g)?.length).toBeGreaterThanOrEqual(2);
    expect(demo).toContain('workloadId="customer-support-router"');
    expect(demo).toContain('workloadName="Enterprise Support Router"');
    expect(demo).toContain("<DemoAccessModal");
  });
});
