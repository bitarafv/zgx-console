"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleHelp } from "lucide-react";
import { mockResources, workloads as fallbackWorkloads } from "@/lib/mock-data";
import type { AllocatedModelMemory, Resources, Workload } from "@/lib/types";

const MODEL_MEMORY_HELP = "Displays pinned memory reserved by loaded model weights and context buffers prior to active inference.";
type LifecycleState = "launching" | "stopping";

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
        if (!workload
          || (current[id] === "stopping" && !workload.active)
          || (current[id] === "launching" && workload.active && workload.runtime_status?.model_transition?.status !== "running")) {
          delete next[id];
        }
      }
      return next;
    });
  }, []);

  const modelTransitionActive = Object.values(lifecycle).includes("launching")
    || workloads.some(item => item.runtime_status?.model_transition?.status === "running");
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
      interval = window.setInterval(() => { if (!document.hidden) void load(); }, modelTransitionActive ? 1000 : 5000);
    };
    const visibility = () => { if (!document.hidden) void load(); };
    start();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [load, modelTransitionActive]);

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
    setLifecycle(current => ({ ...current, [item.id]: "launching" }));
    const progressTab = window.open("/admin/siva/launch/pending", "_blank");
    const result = await act("/admin/siva/api/transitions", { target_workload: item.id });
    const transitionId = typeof result?.transition_id === "string" ? result.transition_id : null;
    if (!transitionId) {
      setLifecycle(current => { const next = { ...current }; delete next[item.id]; return next; });
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
  const activeWorkloadId = workloads.find(item => item.active)?.id ?? null;
  const inferenceSpeed = resources ? averagedInferenceSpeed(resources, Boolean(activeWorkloadId)) : null;
  const sortedWorkloads = useMemo(() => sortWorkloadsByIndustry(workloads), [workloads]);
  const runningModelTransition = workloads.find(item => item.runtime_status?.model_transition?.status === "running")?.runtime_status?.model_transition;
  return <>
    <Hero role={admin ? "Admin View" : "Guest View"}/>
    {error && <div className="alert">{error}</div>}
    <div className="metrics">
      {resources ? <>
        <Metric label="Memory bandwidth" current={resources.memory_bandwidth.current_gbps} max={resources.memory_bandwidth.maximum_gbps} unit="GB/s" help={help ? "Shows how quickly data can move through unified memory, which can limit model execution speed." : undefined}/>
        <Metric label="Tensor active" current={resources.tensor_core.active_percent} max={100} unit="%" help={help ? "Shows how much of the AI accelerator is busy, helping identify available compute capacity." : undefined}/>
        <InferenceMetric value={inferenceSpeed} active={Boolean(activeWorkloadId)} peak={resources.inference_speed.peak} help={help ? "Measures generated tokens per second, a practical indicator of response throughput." : undefined}/>
        <Metric label="SoC power" current={resources.soc_power.current_watts} max={resources.soc_power.limit_watts} unit="W" help={help ? "Compares current system-on-chip power use with its limit to show efficiency and thermal headroom." : undefined}/>
      </> : <p className="muted">Connecting to telemetry…</p>}
    </div>
    <div className="section-head"><div><p className="eyebrow">APPLICATION CONTROL</p><h2>Installed workloads</h2></div><p>Live node status and installed applications.</p></div>
    <div className="workloads">{sortedWorkloads.map(item => {
      const state = lifecycle[item.id];
      const activeModelAllocation = item.runtime_status?.active_model_allocation_mib;
      const hasActiveModelAllocation = Number.isFinite(activeModelAllocation) && Number(activeModelAllocation) > 0;
      const launching = state === "launching";
      const loadingProgress = item.runtime_status?.model_transition?.status === "running"
        ? item.runtime_status.model_transition.progressPercent
        : runningModelTransition?.progressPercent;
      return <article key={item.id} className={item.active || state ? "workload-live" : undefined}>
        <div className="workload-content">
          <div className="workload-card-head"><div className="workload-title"><span className={item.active ? "dot active" : "dot"}/><h3>{item.name}</h3></div><div className="industry-tags" aria-label="Industry verticals">{(item.industry_verticals ?? []).map(value => <span className="industry-chip" key={value}>{value}</span>)}</div></div>
          <p>{item.description}</p>
          <div className="chips model-tags">{[...item.model_names, ...item.intelligence_services].map(value => <ModelBadge key={value} item={item} value={value}/>)}</div>
          {launching
            ? <LoadingModelMemoryMetric progress={loadingProgress}/>
            : item.id === "noteai" && item.active && hasActiveModelAllocation
            ? <NoteAiModelMemoryMetric allocatedMiB={Number(activeModelAllocation)}/>
            : item.id !== "noteai" && item.active && hasAllocatedMemory(allocatedMemory) ? <WorkloadMemoryMetric value={allocatedMemory}/> : null}
          {item.active && item.runtime_status && <ModelTransitionTelemetry status={item.runtime_status}/>}
          <WorkloadFooter item={item} showLifecycle={state === "stopping"}/>
        </div>
        <div className="workload-actions">
          {item.active && usableEndpoint(item.browser_url) && (admin
            ? <a className="workload-open" href={item.browser_url!} target="_blank" rel="noopener">Open the app</a>
            : <button type="button" className="workload-open" disabled title="Admin access required">Open the app</button>)}
          <button className={item.active ? "workload-stop" : "workload-launch"} disabled={!admin || Boolean(state)} title={!admin ? "Admin access required" : state ? "Waiting for model transition" : undefined} onClick={() => item.active ? void stop(item) : void launch(item)}>{state === "launching" ? "Loading…" : state === "stopping" ? "Stopping…" : item.active ? "Stop" : "Launch / switch"}</button>
        </div>
      </article>;
    })}</div>
  </>;
}

function averagedInferenceSpeed(resources: Resources, active: boolean) {
  const raw = Math.max(0, resources.inference_speed.tokens_per_second || 0);
  const average = Math.max(0, resources.inference_speed.average ?? 0);
  if (active && raw === 0 && average === 0) return null;
  return average > 0 ? average : raw;
}

function sortWorkloadsByIndustry(items: Workload[]) {
  return [...items].sort((left, right) => {
    const leftIndustry = left.industry_verticals?.[0] ?? "Other";
    const rightIndustry = right.industry_verticals?.[0] ?? "Other";
    return leftIndustry.localeCompare(rightIndustry, undefined, { sensitivity: "base" })
      || left.name.localeCompare(right.name, undefined, { sensitivity: "base" });
  });
}

function usableEndpoint(value: string | null | undefined) {
  return Boolean(value && value !== "#" && /^https?:\/\//.test(value));
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

function ModelBadge({ item, value }: { item: Workload; value: string }) {
  const name = displayModelName(value.split("@")[0]);
  const awq = name === "Qwen/Qwen3-32B-AWQ";
  const bf16 = name === "Qwen/Qwen3-32B-BF16";
  if (!awq && !bf16) return <span>{name}</span>;
  const active = Boolean(item.runtime_status?.ready && ((awq && item.runtime_status.active_model === "awq") || (bf16 && item.runtime_status.active_model === "bf16")));
  return <span className={`model-badge ${active ? "active" : "inactive"}`}>{name} <b>({active ? "Active" : "non-Active"})</b></span>;
}

function WorkloadMemoryMetric({ value }: { value: AllocatedModelMemory & { allocated_mib: number; capacity_mib: number } }) {
  const current = value.allocated_mib / 1024;
  const max = value.capacity_mib / 1024;
  const percent = max > 0 ? Math.min(100, Math.round(current / max * 100)) : 0;
  return <div className="workload-memory" aria-live="polite"><div><MetricLabel label="Allocated Model VRAM" help={MODEL_MEMORY_HELP}/><strong>{current.toFixed(1)} GiB</strong></div><div className="meter"><i style={{ width: `${percent}%` }}/></div><small>{percent}% of {max.toFixed(1)} GiB</small></div>;
}

function LoadingModelMemoryMetric({ progress }: { progress?: number }) {
  const percent = Math.max(0, Math.min(100, Math.round(progress ?? 0)));
  return <div className="workload-memory workload-memory-loading" aria-live="polite" aria-busy="true"><div><MetricLabel label="Allocated Model VRAM" help={MODEL_MEMORY_HELP}/><strong>{percent}%</strong></div><div className="meter"><i style={{ width: `${percent}%` }}/></div><small>{percent > 0 ? `Loading model… ${percent}%` : "Starting model load…"}</small></div>;
}

function NoteAiModelMemoryMetric({ allocatedMiB }: { allocatedMiB: number }) {
  const capacityGiB = 121.6;
  const allocatedGiB = allocatedMiB / 1024;
  const percent = Math.max(0, Math.min(100, Math.round(allocatedGiB / capacityGiB * 100)));
  return <div className="workload-memory noteai-model-memory" aria-live="polite"><div><MetricLabel label="Allocated Model VRAM" help={MODEL_MEMORY_HELP}/><strong>{allocatedGiB.toFixed(1)} GiB</strong></div><div className="meter"><i style={{ width: `${percent}%` }}/></div><small>{percent}% of 121.6 GiB Unified Memory</small></div>;
}

function ModelTransitionTelemetry({ status }: { status: NonNullable<Workload["runtime_status"]> }) {
  const transition = status.model_transition;
  const running = transition?.status === "running";
  if (!running && !transition?.error?.reason) return null;
  const progress = Math.max(0, Math.min(100, transition?.progressPercent ?? 0));
  const serviceStates = running ? loadingServiceStates(status) : [];
  return <section className={`model-runtime ${running ? "loading" : "failed"}`} aria-live="polite">
    {running && <><header><div><small>Model transition</small><strong>{transition.phase?.replaceAll("_", " ")}</strong></div><em>{progress}%</em></header><div className="model-progress"><i style={{ width: `${progress}%` }}/></div><div className="model-runtime-grid">
      <span><small>Progress</small><strong>{progress}%</strong></span>
      <span><small>Elapsed Time</small><strong>{formatMilliseconds(transition.elapsedMs)}</strong></span>
    </div></>}
    {transition?.error?.reason && <p className="model-runtime-error">{transition.error.reason}{transition.recovery ? " · AWQ recovery active" : ""}</p>}
    {running && <div className="container-states">{serviceStates.map(({ label, name, value }) => <span key={label} title={name}>{label}: <b>{value}</b></span>)}</div>}
  </section>;
}

function displayModelName(value: string) {
  return value === "Qwen/Qwen3-32B" ? "Qwen/Qwen3-32B-BF16" : value;
}

function loadingServiceStates(status: NonNullable<Workload["runtime_status"]>) {
  const containers = status.containers ?? {};
  const target = status.model_transition?.targetModel ?? "";
  const bf16 = target.includes("bf16");
  const names = [
    ["composer", bf16 ? "noteainano-composer-bf16-1" : "noteainano-composer-1"],
    ["llm", bf16 ? "noteainano-llm-bf16-1" : "noteainano-llm-1"],
    ["speech", "noteainano-speech-1"],
    ["privaterounds", "privaterounds"],
  ] as const;
  return names.map(([label, name]) => ({ label, name, value: containers[name] ?? "unknown" }));
}

function formatMilliseconds(value?: number) { return Number.isFinite(value) ? formatDuration(Math.max(0, Math.round(Number(value) / 1000))) : "—"; }


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

function InferenceMetric({ value, active, peak, help }: { value: number | null; active: boolean; peak?: number | null; help?: string }) {
  if (active && value == null) {
    return <article className="metric metric-waiting"><div><MetricLabel label="Inference speed" help={help}/></div><div className="meter"><i style={{ width: "0%" }}/></div><small>Throughput appears when generation begins</small></article>;
  }
  const current = value ?? 0;
  return <Metric label="Inference speed" current={current} max={Math.max(peak ?? current, 1)} unit="t/s" help={help} maximumLabel="observed peak"/>;
}

function MetricLabel({ label, help }: { label: string; help?: string }) {
  if (!help) return <span>{label}</span>;
  const id = `help-${label.replaceAll(" ", "-").toLowerCase()}`;
  return <span className="metric-label"><span>{label}</span><button type="button" className="metric-help" aria-label={`About ${label}`} aria-describedby={id} onKeyDown={event => { if (event.key === "Escape") event.currentTarget.blur(); }}><CircleHelp size={14}/><span role="tooltip" id={id}>{help}</span></button></span>;
}
