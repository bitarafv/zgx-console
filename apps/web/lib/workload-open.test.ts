import { describe, expect, it } from "vitest";
import { workloadOpenControl } from "./workload-open";
import type { Workload } from "./types";

function workload(overrides: Partial<Workload> = {}): Workload {
  return {
    id: "noteai",
    name: "Doctor NoteAI",
    active: true,
    description: "Clinical notes",
    browser_url: "https://notes.bncvc.com",
    model_names: [],
    intelligence_services: [],
    expected_cold_load_seconds: 600,
    runtime_status: { ready: true },
    ...overrides,
  };
}

describe("workload open control", () => {
  it("opens the allowlisted Hermes terminal through the authenticated proxy", () => {
    expect(workloadOpenControl(workload({
      id: "hermes",
      browser_url: null,
      interactive_terminal: { path: "/terminal/hermes" },
    }), true)).toEqual({ href: "/admin/siva/terminal/hermes", label: "Open terminal" });
  });

  it("opens relative Siva application URLs through the authenticated mount", () => {
    expect(workloadOpenControl(workload({ id: "aml-fraud-agent", browser_url: null, external_browser_url: "https://aml.bncvc.com", open_url: "/apps/aml-fraud-agent/" }), true)).toEqual({
      href: "https://aml.bncvc.com/",
      label: "Open the app",
    });
  });

  it("prefers the dedicated AML origin over the internal proxy mount", () => {
    expect(workloadOpenControl(workload({
      id: "aml-fraud-agent",
      browser_url: "http://localhost:8005",
      external_browser_url: "https://aml.bncvc.com",
      open_url: "/apps/aml-fraud-agent/",
    }), true)).toEqual({ href: "https://aml.bncvc.com/", label: "Open the app" });
  });

  it("opens Contract & Legal Auditor through its external hostname", () => {
    expect(workloadOpenControl(workload({
      id: "rag-legal-auditor",
      browser_url: "http://localhost:8004",
      external_browser_url: "https://contract.bncvc.com?demo=true",
      open_url: "/apps/rag-legal-auditor/",
    }), true)).toEqual({ href: "https://contract.bncvc.com/", label: "Open the app" });
  });

  it("preserves proxied application query parameters without adding mode flags", () => {
    expect(workloadOpenControl(workload({
      id: "future-app",
      browser_url: null,
      open_url: "/apps/future-app/workspace?tenant=north#cases",
    }), true)).toEqual({
      href: "/admin/siva/apps/future-app/workspace?tenant=north#cases",
      label: "Open the app",
    });
  });

  it("opens browser workloads in production mode", () => {
    expect(workloadOpenControl(workload(), true)).toEqual({
      href: "https://notes.bncvc.com/",
      label: "Open the app",
    });
  });

  it("opens Support Router through its external hostname instead of Mac localhost", () => {
    expect(workloadOpenControl(workload({
      id: "customer-support-router",
      browser_url: "http://localhost:8006",
      external_browser_url: "https://router.bncvc.com",
    }), true)).toEqual({
      href: "https://router.bncvc.com/",
      label: "Open the app",
    });
  });

  it("rejects unapproved terminals and missing destinations", () => {
    expect(workloadOpenControl(workload({ id: "other", browser_url: null, interactive_terminal: { path: "/terminal/other" } }), true)).toBeNull();
  });

  it("waits for explicit workload readiness before offering an open destination", () => {
    expect(workloadOpenControl(workload({ runtime_status: { ready: false } }), true)).toBeNull();
    expect(workloadOpenControl(workload({ runtime_status: undefined }), true)).toBeNull();
  });

  it("hides the control while a model transition is running or failed", () => {
    expect(workloadOpenControl(workload({
      runtime_status: { ready: true, model_transition: { status: "running" } },
    }), true)).toBeNull();
    expect(workloadOpenControl(workload({
      runtime_status: { ready: true, model_transition: { status: "failed" } },
    }), true)).toBeNull();
  });

  it("shows the control after the model transition reports ready", () => {
    expect(workloadOpenControl(workload({
      runtime_status: { ready: true, model_transition: { status: "ready" } },
    }), true)).toEqual({
      href: "https://notes.bncvc.com/",
      label: "Open the app",
    });
  });

  it("exposes ready external browser workloads to guests but keeps inactive workloads hidden", () => {
    expect(workloadOpenControl(workload({ active: false }), true)).toBeNull();
    expect(workloadOpenControl(workload(), false)).toEqual({ href: "https://notes.bncvc.com/", label: "Open the app" });
  });

  it("exposes ready AML directly through its dedicated origin to guests", () => {
    expect(workloadOpenControl(workload({ id: "aml-fraud-agent", external_browser_url: "https://aml.bncvc.com" }), false)).toEqual({
      href: "https://aml.bncvc.com/",
      label: "Open the app",
    });
  });

  it("keeps authenticated terminal and proxy destinations admin-only", () => {
    expect(workloadOpenControl(workload({ id: "hermes", interactive_terminal: { path: "/terminal/hermes" } }), false)).toBeNull();
    expect(workloadOpenControl(workload({ id: "future-app", open_url: "/apps/future-app/" }), false)).toBeNull();
  });
});
