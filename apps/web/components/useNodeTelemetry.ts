"use client";
import { useEffect, useState } from "react";
import type { Capability, Resources, Workload } from "../lib/types";
import { appendSample, workloadObservations, type Observation, type Sample } from "../lib/observatory";

type State = {
  capability: Capability | null; resources: Resources | null; workloads: Workload[];
  sessionId: number | null; receivedAt: number | null; failed: boolean; history: Sample[]; observations: Observation[];
};
const INITIAL: State = { capability: null, resources: null, workloads: [], sessionId: null, receivedAt: null, failed: false, history: [], observations: [] };

export function useNodeTelemetry(adminView: boolean) {
  const [state, setState] = useState<State>(INITIAL);
  const [now, setNow] = useState(0);
  useEffect(() => {
    let stopped = false, busy = false;
    let controller: AbortController | null = null;
    async function poll() {
      if (stopped || busy || document.hidden) return;
      busy = true;
      controller = new AbortController();
      const active = controller;
      const timeout = window.setTimeout(() => active.abort(), 4500);
      async function get<T>(path: string): Promise<T> {
        const response = await fetch(path, { cache: "no-store", signal: active.signal });
        if (!response.ok) throw new Error("Telemetry unavailable");
        return response.json() as Promise<T>;
      }
      try {
        const capability = await get<Capability>(adminView ? "/api/admin/capability" : "/api/capability");
        if (!["static", "live-guest", "live-admin", "stale"].includes(capability.state) || !["mock", "node", "cloud"].includes(capability.mode)) throw new Error("Invalid capability");
        if (capability.state === "static") {
          if (!stopped) setState({ ...INITIAL, capability }); // No historical data after sharing is withdrawn.
          return;
        }
        const [resources, workloads] = await Promise.all([get<Resources>("/api/resources"), get<Workload[]>("/api/workloads")]);
        if (!resources || typeof resources.sampled_at !== "string" || !Array.isArray(workloads) || !workloads.every(item => item && typeof item.id === "string" && typeof item.name === "string" && typeof item.active === "boolean" && Array.isArray(item.model_names) && Array.isArray(item.intelligence_services) && item.model_names.every(name => typeof name === "string") && item.intelligence_services.every(name => typeof name === "string") && typeof item.description === "string")) throw new Error("Invalid telemetry payload");
        const at = Date.now();
        if (!stopped) setState(previous => {
          const changedMode = previous.capability?.mode !== capability.mode;
          const history = changedMode ? [] : previous.history;
          const observations = changedMode ? [] : previous.observations;
          const events = changedMode || previous.receivedAt === null
            ? [{ id: `${at}:connected`, at, text: capability.mode === "mock" ? "Connected to demonstration data, not live hardware." : "Telemetry connection established." }]
            : workloadObservations(previous.workloads, workloads, at);
          return { capability, resources, workloads, sessionId: changedMode || previous.receivedAt === null ? at : previous.sessionId, receivedAt: at, failed: false,
            history: appendSample(history, resources, at), observations: [...observations, ...events].slice(-80) };
        });
      } catch {
        if (!stopped) setState(previous => ({ ...previous, failed: true }));
      } finally {
        clearTimeout(timeout);
        busy = false;
      }
    }
    const tick = () => { setNow(Date.now()); void poll(); };
    const initialTick = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => { stopped = true; clearTimeout(initialTick); clearInterval(interval); controller?.abort(); document.removeEventListener("visibilitychange", tick); };
  }, [adminView]);
  return { ...state, now };
}
