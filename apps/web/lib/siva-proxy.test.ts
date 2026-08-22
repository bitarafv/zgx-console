import { describe, expect, it } from "vitest";
import { allowedSivaMethod, rewriteSivaHtml, sivaPath } from "./siva-proxy";

describe("Siva admin proxy", () => {
  it("maps only explicit Siva routes", () => {
    expect(sivaPath()).toBe("/");
    expect(sivaPath(["launch", "pending"])).toBe("/launch/pending");
    expect(sivaPath(["api", "transitions", "abc-123"])).toBe("/api/transitions/abc-123");
    expect(sivaPath(["api", "workloads", "noteai", "stop"])).toBe("/api/workloads/noteai/stop");
    expect(sivaPath(["api", "workloads", "..", "stop"])).toBeNull();
    expect(sivaPath(["debug"])).toBeNull();
  });
  it("restricts methods by route", () => {
    expect(allowedSivaMethod("GET", "/api/resources")).toBe(true);
    expect(allowedSivaMethod("POST", "/api/resources")).toBe(false);
    expect(allowedSivaMethod("POST", "/api/transitions")).toBe(true);
    expect(allowedSivaMethod("DELETE", "/api/workloads/noteai/stop")).toBe(false);
  });
  it("rewrites root-relative console routes", () => {
    const rewritten = rewriteSivaHtml(`fetch('/api/workloads');window.open('/launch/pending');fetch("/api/policy")`);
    expect(rewritten).toContain("fetch('/admin/siva/api/workloads')");
    expect(rewritten).toContain("window.open('/admin/siva/launch/pending')");
    expect(rewritten).toContain('fetch("/admin/siva/api/policy")');
  });
});
