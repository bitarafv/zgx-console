import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../components/WorkloadProblemTooltip.tsx", import.meta.url), "utf8");

describe("workload problem tooltips", () => {
  it.each(["noteai", "scribeai", "dietplan", "dossierai", "rag-legal-auditor", "aml-fraud-agent", "customer-support-router", "qwen-dev", "hermes"])("defines audience, problem, and impact copy for %s", id => {
    expect(source).toContain(id);
  });

  it("is available to pointer and keyboard users", () => {
    expect(source).toContain('aria-label={`Problem solved by ${name}`}');
    expect(source).toContain('role="tooltip"');
    expect(source).toContain('event.key === "Escape"');
  });
});
