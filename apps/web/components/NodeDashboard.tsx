"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleHelp } from "lucide-react";
import { mockResources, workloads as fallbackWorkloads } from "@/lib/mock-data";
import type { AllocatedModelMemory, Resources, Workload } from "@/lib/types";

const MODEL_MEMORY_HELP = "Displays pinned memory reserved by loaded model weights and context buffers prior to active inference.";
type LifecycleState = "stopping";

export function NodeDashboard({ adminView = false }: { adminView?: boolean }) {
  const [resources, setResources] = useState<Resources | null>(() => adminView ? null : mockResources());
  const [workloads, setWorkloads] = useState<Workload[]>(adminView ? [] : fallbackWorkloads);
  const [error, setError] = useState("");
  const [lifecycle, setLifecycle] = useState<Record<string, LifecycleState>>({});

  const reconcileLifecycle = useCallback((items: Workload[]) => {
    setLifecycle(current => {
      const next = { ...current };
      for (const id of Object.keys(current)) {
        const workload = items.find(item => item.id === id);
        if (!workload || !workload.active) delete next[id];
      }
      return next;
    });
  }, []);

  const load = useCallback(async () => {
    const [resourceResult, workloadResult] = await Promise.allSettled([
      fetchJson<Resources>("/api/resources"),
      fetchJson<Workload[]>("/api/workloads"),
    ]);

    if (resourceResult.status === "fulfilled") {
      setResources(resourceResult.value);
    } else if (!adminView) {
      setResources(mockResources());
    }

    if (workloadResult.status === "fulfilled") {
      setWorkloads(workloadResult.value);
      reconcileLifecycle(workloadResult.value);
    } else if (!adminView) {
      setWorkloads(fallbackWorkloads);
    }
  }, [adminView, reconcileLifecycle]);

  useEffect(() => {
    let interval: number | undefined;
    const start = () => {
      void load();
      interval = window.setInterval(() => { if (!document.hidden) void load(); }, 1000);
    };
    const visibility = () => { if (!document.hidden) void load(); };
    start();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [load]);

  async function act(path: string, body: object) {
    setError("");
    const response = await fetch(path, {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      setError(await actionError(response));
      return null;
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      setError("Admin session could not be verified. Refresh the Admin page and try again.");
      return null;
    }
    const result = await response.json().catch(() => null) as Record<string, unknown> | null;
    if (!result) {
      setError("The node returned an invalid action response.");
      return null;
    }
    void load();
    return result;
  }

  async function stop(item: Workload) {
    setLifecycle(current => ({ ...current, [item.id]: "stopping" }));
    if (!await act(`/admin/siva/api/workloads/${item.id}/stop`, {})) {
      setLifecycle(current => { const next = { ...current }; delete next[item.id]; return next; });
    }
  }

  async function launch(item: Workload) {
    setLifecycle(current => { const next = { ...current }; delete next[item.id]; return next; });
    const progressTab = window.open("/admin/siva/launch/pending", "_blank");
    const result = await act("/admin/siva/api/transitions", { target_workload: item.id });
    const transitionId = typeof result?.transition_id === "string" ? result.transition_id : null;
    if (!transitionId) {
      progressTab?.close();
      if (result) setError("Siva did not return a launch transition. Try again.");
      return;
    }
    const progressUrl = `/admin/siva/launch/${encodeURIComponent(transitionId)}`;
    if (progressTab) progressTab.location.assign(progressUrl);
    else setError(`Launch started, but the progress tab was blocked. Allow pop-ups and open ${progressUrl}.`);
  }

  const admin = adminView;
  const help = true;
  const allocatedMemory = resources ? modelMemory(resources) : undefined;
  const sortedWorkloads = useMemo(() => sortWorkloadsByIndustry(workloads), [workloads]);
  return <>
    <Hero role={admin ? "Admin View" : "Guest View"}/>
    {error && <div className="alert">{error}</div>}
    <div className="metrics">
      {resources ? <>
        <Metric label="Memory bandwidth" current={resources.memory_bandwidth.current_gbps} max={resources.memory_bandwidth.maximum_gbps} unit="GB/s" help={help ? "Shows how quickly data can move through unified memory, which can limit model execution speed." : undefined}/>
        <Metric label="Tensor active" current={resources.tensor_core.active_percent} max={100} unit="%" help={help ? "Shows how much of the AI accelerator is busy, helping identify available compute capacity." : undefined}/>
        <Metric label="Inference speed" current={resources.inference_speed.tokens_per_second} max={Math.max(resources.inference_speed.peak ?? resources.inference_speed.tokens_per_second, 1)} unit="t/s" help={help ? "Measures generated tokens per second, a practical indicator of response throughput." : undefined}/>
        <Metric label="SoC power" current={resources.soc_power.current_watts} max={resources.soc_power.limit_watts} unit="W" help={help ? "Compares current system-on-chip power use with its limit to show efficiency and thermal headroom." : undefined}/>
      </> : <p className="muted">Connecting to telemetry…</p>}
    </div>
    <div className="section-head"><div><p className="eyebrow">APPLICATION CONTROL</p><h2>Installed workloads</h2></div><p>Live node status and installed applications.</p></div>
    <div className="workloads">{sortedWorkloads.map(item => {
      const state = lifecycle[item.id];
      return <article key={item.id} className={item.active || state ? "workload-live" : undefined}>
        <div className="workload-content">
          <div className="workload-card-head"><div className="workload-title"><span className={item.active ? "dot active" : "dot"}/><h3>{item.name}</h3></div><div className="industry-tags" aria-label="Industry verticals">{(item.industry_verticals ?? []).map(value => <span className="industry-chip" key={value}>{value}</span>)}</div></div>
          <p>{item.description}</p>
          <div className="chips model-tags">{[...item.model_names, ...item.intelligence_services].map(value => <span key={value}>{value.split("@")[0]}</span>)}</div>
          {item.active && hasAllocatedMemory(allocatedMemory) && <WorkloadMemoryMetric value={allocatedMemory}/>}
          <WorkloadFooter item={item} showLifecycle={state === "stopping"}/>
        </div>
        <button disabled={!admin || Boolean(state)} title={!admin ? "Admin access required" : state ? "Waiting for unload confirmation" : undefined} onClick={() => item.active ? void stop(item) : void launch(item)}>{state === "stopping" ? "Stopping…" : item.active ? "Stop" : "Launch / switch"}</button>
      </article>;
    })}</div>
  </>;
}

function sortWorkloadsByIndustry(items: Workload[]) {
  return [...items].sort((left, right) => {
    const leftIndustry = left.industry_verticals?.[0] ?? "Other";
    const rightIndustry = right.industry_verticals?.[0] ?? "Other";
    return leftIndustry.localeCompare(rightIndustry, undefined, { sensitivity: "base" })
      || left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
  });
}

async function actionError(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    if (body?.error) return body.error;
  }
  if (response.status === 401 || response.status === 403) return "Admin session expired. Refresh the Admin page and sign in again.";
  return `Action failed (${response.status}).`;
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

function Hero({ role }: { role: string }) {
  return <div className="hero compact dashboard-intro"><div><p className="eyebrow">PHYSICAL DEVICE</p><p>Workload ownership and resource telemetry on the ZGX Nano.</p></div><span className={role.startsWith("Admin") ? "role admin" : "role guest"}>{role}</span></div>;
}

function modelMemory(resources: Resources): AllocatedModelMemory | undefined {
  if (resources.allocated_model_memory) return resources.allocated_model_memory;
  const gpu = resources.gpu;
  if (gpu?.mode === "memory" && gpu.total_mib != null && gpu.workload_used_mib != null) {
    return {
      allocated_mib: gpu.workload_used_mib,
      capacity_mib: gpu.total_mib,
      utilization_percent: gpu.total_mib ? gpu.workload_used_mib / gpu.total_mib * 100 : 0,
      source: "nvidia-smi",
      available: true,
    };
  }
  return undefined;
}

function hasAllocatedMemory(value?: AllocatedModelMemory): value is AllocatedModelMemory & { allocated_mib: number; capacity_mib: number } {
  return Boolean(value?.available && value.allocated_mib != null && value.allocated_mib > 0 && value.capacity_mib != null && value.capacity_mib > 0);
}

function WorkloadMemoryMetric({ value }: { value: AllocatedModelMemory & { allocated_mib: number; capacity_mib: number } }) {
  const current = value.allocated_mib / 1024;
  const max = value.capacity_mib / 1024;
  const percent = max > 0 ? Math.min(100, Math.round(current / max * 100)) : 0;
  return <div className="workload-memory" aria-live="polite"><div><MetricLabel label="Allocated Model VRAM" help={MODEL_MEMORY_HELP}/><strong>{current.toFixed(1)} GiB / {max.toFixed(max % 1 ? 1 : 0)} GiB Unified</strong></div><div className="meter"><i style={{ width: `${percent}%` }}/></div><small>{percent}% pinned before inference</small></div>;
}

function WorkloadFooter({ item, showLifecycle }: { item: Workload; showLifecycle: boolean }) {
  const endpoint = item.browser_url && item.browser_url !== "#" ? item.browser_url : "Unavailable";
  const residency = item.model_residency
    ? lifecycleLabel(item.model_residency, "residency")
    : item.shared_services?.length ? "Warm / Shared (inferred)" : "Unknown";
  return <footer className="workload-telemetry" aria-live="polite">
    <span><small>Launch estimate</small><strong>~{formatDuration(item.expected_cold_load_seconds)}</strong></span>
    <span><small>Endpoint HTTP</small><strong title={endpoint}>{endpoint}</strong></span>
    {showLifecycle && <>
      <span className="lifecycle-detail"><small>Model resident status</small><strong>{residency}</strong></span>
      <span className="lifecycle-detail"><small>Idle retention</small><strong>Release pending confirmation</strong></span>
    </>}
  </footer>;
}

function lifecycleLabel(value: Workload["model_residency"] | Workload["idle_retention"], kind: "residency" | "retention") {
  const labels: Record<string, string> = kind === "residency"
    ? { resident: "Resident", "warm-shared": "Warm / Shared in Memory", unmapped: "Unmapped", unknown: "Unknown" }
    : { retained: "Retained", releasing: "Releasing", released: "Released", unknown: "Unknown" };
  return value ? labels[value] ?? "Unknown" : "Unknown";
}

function formatDuration(seconds: number) {
  return seconds >= 60 ? `${Math.round(seconds / 60)} min` : `${seconds} sec`;
}

function Metric({ label, current, max, unit, help, maximumLabel }: { label: string; current: number; max: number; unit: string; help?: string; maximumLabel?: string }) {
  const percent = max > 0 ? Math.min(100, Math.round(current / max * 100)) : 0;
  return <article className="metric"><div><MetricLabel label={label} help={help}/><strong>{current.toFixed(current % 1 ? 1 : 0)} {unit}</strong></div><div className="meter"><i style={{ width: `${percent}%` }}/></div><small>{percent}% of {maximumLabel ?? "measured maximum"}</small></article>;
}

function MetricLabel({ label, help }: { label: string; help?: string }) {
  if (!help) return <span>{label}</span>;
  const id = `help-${label.replaceAll(" ", "-").toLowerCase()}`;
  return <span className="metric-label"><span>{label}</span><button type="button" className="metric-help" aria-label={`About ${label}`} aria-describedby={id} onKeyDown={event => { if (event.key === "Escape") event.currentTarget.blur(); }}><CircleHelp size={14}/><span role="tooltip" id={id}>{help}</span></button></span>;
}
