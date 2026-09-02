import { productionModeUrl } from "./demo-mode";
import type { Workload } from "./types";

export type WorkloadOpenControl = { href: string; label: "Open terminal" | "Open the app" };

export function workloadOpenControl(item: Workload, admin: boolean): WorkloadOpenControl | null {
  const transitionStatus = item.runtime_status?.model_transition?.status;
  if (
    !item.active
    || item.runtime_status?.ready !== true
    || transitionStatus === "running"
    || transitionStatus === "failed"
  ) return null;

  if (item.id === "hermes" && item.interactive_terminal?.path === "/terminal/hermes") {
    return admin ? { href: "/admin/siva/terminal/hermes", label: "Open terminal" } : null;
  }

  if (item.id === "rag-legal-auditor" || item.id === "aml-fraud-agent") {
    const href = productionModeUrl(item.external_browser_url);
    return href ? { href, label: "Open the app" } : null;
  }

  if (item.open_url?.startsWith("/apps/")) {
    if (!admin) return null;
    const url = new URL(item.open_url, "http://siva.local");
    return { href: `/admin/siva${url.pathname}${url.search}${url.hash}`, label: "Open the app" };
  }

  const href = productionModeUrl(item.external_browser_url ?? item.browser_url);
  return href ? { href, label: "Open the app" } : null;
}
