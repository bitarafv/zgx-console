"use client";
import { useSyncExternalStore } from "react";
import { parseOptions, type Options } from "../lib/observatory";
const KEY = "zgx.dashboard.options.v1";
const EVENT = "zgx-dashboard-options";
let fallback = "";
let memoryOnly = false;
function stored() { if (memoryOnly) return fallback; try { return window.localStorage.getItem(KEY) || ""; } catch { return fallback; } }
function snapshot() { return JSON.stringify([stored(), window.location.search]); }
const serverSnapshot = () => '["",""]';
function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener("popstate", notify);
  window.addEventListener(EVENT, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener("popstate", notify);
    window.removeEventListener(EVENT, notify);
  };
}
export function useDashboardOptions() {
  const state = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const [raw, search] = JSON.parse(state) as [string, string];
  const options = parseOptions(raw);
  const query = new URLSearchParams(search);
  if (query.get("dashboard") === "classic" || query.get("dashboard") === "observatory") options.view = query.get("dashboard") as Options["view"];
  if (query.has("workload")) options.workload = query.get("workload") || "";
  function update(patch: Partial<Options>) {
    fallback = JSON.stringify({ ...options, ...patch });
    try { window.localStorage.setItem(KEY, fallback); } catch { memoryOnly = true; /* Preferences remain usable in this window. */ }
    const url = new URL(window.location.href);
    if (patch.view !== undefined) url.searchParams.set("dashboard", patch.view);
    if (patch.workload !== undefined) url.searchParams.set("workload", patch.workload);
    window.history.replaceState(window.history.state, "", url);
    window.dispatchEvent(new Event(EVENT));
  }
  return { options, update };
}
