"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CircleHelp } from "lucide-react";
import { demoModeUrl, productionModeUrl } from "@/lib/demo-mode";
import { workloadOpenControl } from "@/lib/workload-open";
import { TokenSavingsMeter } from "./TokenSavingsMeter";
import { DemoBookingAdmin } from "./DemoBookingAdmin";
import type { AdminBookingData } from "@/lib/bookings-types";
import type { AllocatedModelMemory, Resources, Workload } from "@/lib/types";

const MODEL_MEMORY_HELP = "Displays pinned memory reserved by loaded model weights and context buffers prior to active inference.";
type LifecycleState = "launching" | "stopping";
const EMPTY_WORKLOADS: Workload[] = [];

export function NodeDashboard({ adminView = false, adminBookingData }: { adminView?: boolean; adminBookingData?: AdminBookingData }) {
  const [resources, setResources] = useState<Resources | null>(null);
  const [workloads, setWorkloads] = useState<Workload[] | null>(null);
  const [resourceError, setResourceError] = useState(false);
  const [workloadError, setWorkloadError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState("");
  const [lifecycle, setLifecycle] = useState<Record<string, LifecycleState>>({});
  const [launchSort, setLaunchSort] = useState<"fastest" | "slowest">("fastest");
  const [industryFilter, setIndustryFilter] = useState("all");
  const actionErrorRef = useRef("");
  const transitionActiveRef = useRef(false);

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
    || (workloads ?? []).some(item => Boolean(item.scheduler_activity))
    || (workloads ?? []).some(item => item.active && item.runtime_status?.ready !== true)
    || (workloads ?? []).some(item => item.runtime_status?.model_transition?.status === "running");
  useEffect(() => { transitionActiveRef.current = modelTransitionActive; }, [modelTransitionActive]);
  const load = useCallback(async (signal: AbortSignal) => {
    const [resourceResult, workloadResult] = await Promise.allSettled([
      fetchJson<Resources>("/api/resources", signal),
      fetchJson<Workload[]>("/api/workloads", signal),
    ]);

    if (signal.aborted) return;

    if (resourceResult.status === "fulfilled") {
      setResources(resourceResult.value);
      setResourceError(false);
    } else {
      setResourceError(true);
    }

    if (workloadResult.status === "fulfilled") {
      setWorkloads(workloadResult.value);
      setWorkloadError(false);
      reconcileLifecycle(workloadResult.value);
    } else {
      setWorkloadError(true);
    }
  }, [reconcileLifecycle]);

  useEffect(() => {
    let stopped = false;
    let timer: number | undefined;
    let inFlight = false;
    const controller = new AbortController();
    const schedule = () => {
      if (stopped) return;
      timer = window.setTimeout(run, transitionActiveRef.current ? 1000 : 5000);
    };
    const run = async () => {
      if (stopped || inFlight) return;
      if (document.hidden) {
        schedule();
        return;
      }
      inFlight = true;
      try {
        await load(controller.signal);
      } finally {
        inFlight = false;
        schedule();
      }
    };
    const visibility = () => {
      if (document.hidden || inFlight) return;
      if (timer) window.clearTimeout(timer);
      void run();
    };
    void run();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      stopped = true;
      controller.abort();
      if (timer) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [load, refreshKey]);

  const refresh = useCallback(() => setRefreshKey(value => value + 1), []);

  async function act(path: string, body: object) {
    setError("");
    actionErrorRef.current = "";
    const response = await fetch(path, {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      actionErrorRef.current = await actionError(response);
      setError(actionErrorRef.current);
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
    refresh();
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
    const launchModel = launchDisplayModel(item);
    const result = await act("/admin/siva/api/transitions", {
      target_workload: item.id,
      ...(item.id === "dossierai" && launchModel ? { target_models: [launchModel] } : {}),
    });
    const transitionId = typeof result?.transition_id === "string" ? result.transition_id : null;
    if (!transitionId) {
      setLifecycle(current => { const next = { ...current }; delete next[item.id]; return next; });
      if (progressTab) {
        const detail = actionErrorRef.current || "Siva did not return a launch transition. Try again.";
        progressTab.location.assign(`/admin/siva/launch/pending?workload=${encodeURIComponent(item.id)}&error=${encodeURIComponent(detail)}`);
      }
      if (result) setError("Siva did not return a launch transition. Try again.");
      return;
    }
    const progressUrl = `/admin/siva/launch/${encodeURIComponent(transitionId)}${launchModel ? `?model=${encodeURIComponent(launchModel)}` : ""}`;
    if (progressTab) progressTab.location.assign(progressUrl);
    else setError(`Launch started, but the progress tab was blocked. Allow pop-ups and open ${progressUrl}.`);
    const readinessAttempts = Math.max(60, Math.min(1200, item.expected_cold_load_seconds + 120));
    for (let attempt = 0; attempt < readinessAttempts; attempt += 1) {
      await new Promise(resolve => window.setTimeout(resolve, 1000));
      const latest = await fetchJson<Workload[]>("/api/workloads").catch(() => null);
      const launched = latest?.find(workload => workload.id === item.id);
      if (launched?.active && launched.runtime_status?.ready) {
        refresh();
        return;
      }
    }
    setLifecycle(current => { const next = { ...current }; delete next[item.id]; return next; });
    setError(`${item.name} did not become ready within the expected launch window. Check the transition page for details.`);
  }

  const admin = adminView;
  const help = true;
  const allocatedMemory = resources ? modelMemory(resources) : undefined;
  const workloadItems = workloads ?? EMPTY_WORKLOADS;
  const visibleWorkloadItems = useMemo(() => workloadItems.filter(item => item.id !== "dietplan"), [workloadItems]);
  const activeWorkloadId = visibleWorkloadItems.find(item => item.active)?.id ?? null;
  const inferenceSpeed = resources ? averagedInferenceSpeed(resources, Boolean(activeWorkloadId)) : null;
  const industries = useMemo(() => [...new Set(visibleWorkloadItems.flatMap(item => item.industry_verticals ?? []))].sort(), [visibleWorkloadItems]);
  const sortedWorkloads = useMemo(() => visibleWorkloadItems
    .filter(item => industryFilter === "all" || item.industry_verticals?.includes(industryFilter))
    .sort((left, right) => {
      const delta = resourceLaunchEstimate(left) - resourceLaunchEstimate(right);
      return (launchSort === "fastest" ? delta : -delta) || left.name.localeCompare(right.name);
    }), [visibleWorkloadItems, launchSort, industryFilter]);
  const runningModelTransition = workloadItems.find(item => item.runtime_status?.model_transition?.status === "running")?.runtime_status?.model_transition;
  return <>
    <Hero role={admin ? "Admin View" : "Guest View"}/>
    {error && <div className="alert">{error}</div>}
    {(resourceError || workloadError) && Boolean(resources || workloads) && <div className="dashboard-stale" role="status">Live node data is temporarily unavailable. Showing the last successful update.</div>}
    <div className="metrics">
      {resources ? <>
        <Metric label="Memory bandwidth" current={resources.memory_bandwidth.current_gbps} max={resources.memory_bandwidth.maximum_gbps} unit="GB/s" help={help ? "Shows how quickly data can move through unified memory, which can limit model execution speed." : undefined}/>
        <Metric label="Tensor active" current={resources.tensor_core.active_percent} max={100} unit="%" help={help ? "Shows how much of the AI accelerator is busy, helping identify available compute capacity." : undefined}/>
        <InferenceMetric value={inferenceSpeed} active={Boolean(activeWorkloadId)} peak={resources.inference_speed.peak} help={help ? "Measures generated tokens per second, a practical indicator of response throughput." : undefined}/>
        <Metric label="SoC power" current={resources.soc_power.current_watts} max={resources.soc_power.limit_watts} unit="W" help={help ? "Compares current system-on-chip power use with its limit to show efficiency and thermal headroom." : undefined}/>
      </> : resourceError ? <DashboardUnavailable subject="telemetry" onRetry={refresh}/> : <DashboardLoading label="Connecting to telemetry…"/>}
    </div>
    <HardwareContext resources={resources}/>
    <div className="section-head"><div><p className="eyebrow">APPLICATION CONTROL</p><h2>Installed Applications</h2></div><div className="workload-section-tools"><p>Live node status and installed applications.</p><label>Sort<select aria-label="Sort by launch estimate" value={launchSort} onChange={event => setLaunchSort(event.target.value as "fastest" | "slowest")}><option value="fastest">Launch estimate: fastest</option><option value="slowest">Launch estimate: slowest</option></select></label><label>Filter<select aria-label="Filter view by industry" value={industryFilter} onChange={event => setIndustryFilter(event.target.value)}><option value="all">All industries</option>{industries.map(value => <option key={value} value={value}>{value}</option>)}</select></label></div></div>
    {workloads === null
      ? workloadError
        ? <DashboardUnavailable subject="installed applications" onRetry={refresh}/>
        : <DashboardLoading label="Connecting to installed applications…"/>
      : <div className="workloads">{sortedWorkloads.map(item => {
      const state = lifecycle[item.id];
      const workloadMemory = resources?.workload_model_memory?.[item.id];
      const activeModelAllocation = item.runtime_status?.active_model_allocation_mib;
      const hasActiveModelAllocation = Number.isFinite(activeModelAllocation) && Number(activeModelAllocation) > 0;
      const launching = state === "launching";
      const modelLoading = item.runtime_status?.model_transition?.status === "running";
      const loadingProgress = modelLoading
        ? item.runtime_status?.model_transition?.progressPercent
        : runningModelTransition?.progressPercent;
      const hermesTelemetry = item.id === "hermes" && (launching || item.active);
      const showMemory = hermesTelemetry || launching || modelLoading || Boolean(item.active && workloadMemory?.available && workloadMemory.capacity_mib) || (item.id === "noteai" && item.active && hasActiveModelAllocation);
      const demoUrl = workloadDemoUrl(item);
      const openControl = workloadOpenControl(item, admin);
      return <article key={item.id} className={[item.active || state ? "workload-live" : "", showMemory ? "workload-has-memory" : ""].filter(Boolean).join(" ") || undefined}>
        <div className="workload-content">
          <div className="workload-card-head"><div className="workload-title"><span className={item.active ? "dot active" : "dot"}/><h3>{item.name}</h3></div><div className="industry-tags" aria-label="Industry verticals">{(item.industry_verticals ?? []).map(value => <span className="industry-chip" key={value}>{value}</span>)}</div></div>
          {item.scheduler_activity && <SchedulerActivityNotice state={item.scheduler_activity.state}/>}
          <p>{item.description}</p>
          <TokenSavingsMeter item={item}/>
          <div className="chips model-tags">{[...item.model_names, ...item.intelligence_services].map(value => <ModelBadge key={value} item={item} value={value}/>)}</div>
          {hermesTelemetry
            ? <HermesModelMemoryMetric value={workloadMemory ?? allocatedMemory} progress={loadingProgress} loading={launching || modelLoading}/>
            : launching || modelLoading || (item.active && item.runtime_status?.ready !== true)
            ? <LoadingModelMemoryMetric progress={loadingProgress} value={workloadMemory}/>
            : item.id === "noteai" && item.active && hasActiveModelAllocation
            ? <NoteAiModelMemoryMetric allocatedMiB={Number(activeModelAllocation)}/>
            : item.id !== "noteai" && item.active && hasAllocatedMemory(workloadMemory) ? <WorkloadMemoryMetric value={workloadMemory}/> : null}
          {item.active && item.runtime_status && <ModelTransitionTelemetry status={item.runtime_status}/>}
          <WorkloadFooter item={item} showLifecycle={state === "stopping"} showEndpoint={admin}/>
        </div>
        <div className="workload-actions">
          {demoUrl
            ? <a className="workload-demo" href={demoUrl} target="_blank" rel="noopener" onClick={event => {
                event.preventDefault();
                const url = new URL(demoUrl, window.location.href);
                url.searchParams.set("zgx_booking_base", window.location.origin);
                window.open(url.toString(), "_blank", "noopener");
              }}>See a demo</a>
            : <button type="button" className="workload-demo" disabled title="Demo URL unavailable">See a demo</button>}
          {openControl && <a className="workload-open" href={openControl.href} target="_blank" rel="noopener">{openControl.label}</a>}
          <span className={!admin ? "admin-only-control" : undefined} data-tooltip={!admin ? "Admin Mode Only" : undefined}><button className={item.active ? "workload-stop" : "workload-launch"} disabled={!admin || Boolean(state)} title={admin && state ? "Waiting for model transition" : undefined} onClick={() => item.active ? void stop(item) : void launch(item)}>{state === "launching" ? "Loading…" : state === "stopping" ? "Stopping…" : item.active ? "Stop" : "Launch"}</button></span>
        </div>
      </article>;
    })}</div>}
    <p className="savings-assumption">* Electricity: $0.15/kWh · Period: 3 years · Rates are configurable assumptions dated April 2026.</p>
    {admin && <><div className="manageability-links"><span>Advanced administration</span><a href="/admin/siva" target="_blank" rel="noopener">Advanced Siva Diagnostics</a></div><DemoBookingAdmin initialData={adminBookingData}/></>}
  </>;
}

function DashboardLoading({ label }: { label: string }) {
  return <div className="dashboard-loading" role="status" aria-live="polite"><i aria-hidden="true"/><span>{label}</span></div>;
}

function SchedulerActivityNotice({ state }: { state: "loading" | "running" | "cleaning_up" }) {
  const label = state === "loading" ? "Scheduled guest session loading" : state === "running" ? "In use by a scheduled guest session" : "Scheduled guest session cleaning up";
  return <div className={`scheduler-activity ${state}`} role="status" aria-live="polite"><i aria-hidden="true"/><span>{label}</span></div>;
}

function DashboardUnavailable({ subject, onRetry }: { subject: string; onRetry: () => void }) {
  return <div className="dashboard-unavailable" role="alert"><div><strong>Node unavailable</strong><span>Could not load {subject}.</span></div><button type="button" onClick={onRetry}>Retry</button></div>;
}

function averagedInferenceSpeed(resources: Resources, active: boolean) {
  const raw = Math.max(0, resources.inference_speed.tokens_per_second || 0);
  const average = Math.max(0, resources.inference_speed.average ?? 0);
  if (active && raw === 0 && average === 0) return null;
  return average > 0 ? average : raw;
}

function launchDisplayModel(item: Workload) {
  return item.id === "noteai" ? "Qwen/Qwen3-32B-AWQ" : item.id === "dossierai" ? "openai/gpt-oss-20b" : null;
}

function workloadDemoUrl(item: Workload) {
  if (item.id === "rag-legal-auditor") return "/demo/rag-legal-auditor";
  if (item.id === "aml-fraud-agent") return "/demo/aml-fraud-agent";
  if (item.id === "customer-support-router") return "/demo/customer-support-router";
  if (item.id === "dietplan") return "/demo/dietplan";
  if (item.id === "hermes") return "/demo/hermes";
  const configured = item.external_browser_url ?? item.browser_url;
  return demoModeUrl(configured);
}

function HardwareContext({ resources }: { resources: Resources | null }) {
  const memory = resources ? modelMemory(resources) : undefined;
  const capacity = memory?.capacity_mib ? `${(memory.capacity_mib / 1024).toFixed(1)} GiB unified model memory` : "GPU memory discovering";
  const power = resources ? `${resources.soc_power.limit_watts} W SoC compute profile` : "compute profile discovering";
  return <p className="hardware-context"><span>Hardware-aware scheduling</span>{capacity} · {power}. Capacity and launch eligibility update from live node telemetry.</p>;
}

function usableEndpoint(value: string | null | undefined) {
  return Boolean(value && value !== "#" && /^https?:\/\//.test(value));
}

function interactiveTerminalPath(item: Workload): string | null {
  const path = item.interactive_terminal?.path;
  return item.id === "hermes" && path === "/terminal/hermes" ? path : null;
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

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { cache: "no-store", signal });
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
  const dossierModel = isDossier(item) && ` ${name} `.match(/\D(?:20|120)\s*b\D/i);
  const audioModel = item.id === "scribeai";
  const amlModel = item.id === "aml-fraud-agent";
  const legalModel = item.id === "rag-legal-auditor";
  if (!awq && !bf16 && !dossierModel && !audioModel && !amlModel && !legalModel) return <span>{name}</span>;
  if (legalModel) {
    const normalize = (model: string) => model.split("@")[0].trim().toLowerCase();
    const status = item.runtime_status?.model_status?.find(model => normalize(model.id) === normalize(value));
    const active = Boolean(item.runtime_status?.ready && status?.loaded);
    const role = status?.role === "fast" ? "Fast" : status?.role === "precision" ? "Precision" : "Model";
    return <span className={`model-badge ${active ? "active" : "inactive"}`}>{role}: {name} <b>({active ? "Active" : "Inactive"})</b></span>;
  }
  if (amlModel) {
    const capability = item.intelligence_services.includes(value);
    if (capability) {
      const active = Boolean(item.active && item.runtime_status?.ready);
      return <span className={active ? "model-badge active" : "model-badge inactive"}>{name} <b>({active ? "Active" : "Inactive"})</b></span>;
    }
    const normalize = (model: string) => model.split("@")[0].split(" (")[0].trim().toLowerCase();
    const loaded = item.runtime_status?.models ?? [];
    const active = Boolean(item.runtime_status?.ready && loaded.some(model => normalize(model) === normalize(value)));
    return <span className={`model-badge ${active ? "active" : "inactive"}`}>{name} <b>({active ? "Active" : "Inactive"})</b></span>;
  }
  if (dossierModel) {
    const activeModel = item.runtime_status?.model_name ?? item.runtime_status?.models?.[0] ?? item.runtime_status?.active_model ?? "";
    const normalize = (model: string) => model.split("@")[0].trim().toLowerCase();
    const active = Boolean(item.runtime_status?.ready && normalize(activeModel) === normalize(value));
    return <span className={`model-badge ${active ? "active" : "inactive"}`}>{name} <b>({active ? "Active" : "Inactive"})</b></span>;
  }
  if (audioModel) {
    const active = Boolean(item.runtime_status?.ready && item.runtime_status.models?.some(model => model.split("@")[0] === value.split("@")[0]));
    return <span className={`model-badge ${active ? "active" : "inactive"}`}>{name} <b>({active ? "Active" : "Inactive"})</b></span>;
  }
  const active = Boolean(item.runtime_status?.ready && ((awq && item.runtime_status.active_model === "awq") || (bf16 && item.runtime_status.active_model === "bf16")));
  return <span className={`model-badge ${active ? "active" : "inactive"}`}>{name} <b>({active ? "Active" : "non-Active"})</b></span>;
}

function isDossier(item: Workload) {
  return item.id.toLowerCase().includes("dossier") || item.name.toLowerCase().includes("dossier");
}

function WorkloadMemoryMetric({ value }: { value: AllocatedModelMemory & { allocated_mib: number; capacity_mib: number } }) {
  const current = value.allocated_mib / 1024;
  const max = value.capacity_mib / 1024;
  const percent = max > 0 ? Math.min(100, Math.round(current / max * 100)) : 0;
  return <div className="workload-memory" aria-live="polite"><div><MetricLabel label="Allocated Model VRAM" help={MODEL_MEMORY_HELP}/><strong>{current.toFixed(1)} GiB</strong></div><div className="meter"><i style={{ width: `${percent}%` }}/></div><small>{percent}% of {max.toFixed(1)} GiB</small></div>;
}

function LoadingModelMemoryMetric({ progress, value }: { progress?: number; value?: AllocatedModelMemory }) {
  if (value?.available && value.capacity_mib && value.allocated_mib != null) {
    const current = value.allocated_mib / 1024;
    const max = value.capacity_mib / 1024;
    const percent = Math.max(0, Math.min(100, Math.round(current / max * 100)));
    return <div className="workload-memory workload-memory-loading" aria-live="polite" aria-busy="true"><div><MetricLabel label="Allocated Model VRAM" help={MODEL_MEMORY_HELP}/><strong>{current.toFixed(1)} GiB</strong></div><div className="meter"><i style={{ width: `${percent}%` }}/></div><small>Loading model… {percent}% of {max.toFixed(1)} GiB</small></div>;
  }
  const percent = Math.max(0, Math.min(100, Math.round(progress ?? 0)));
  return <div className="workload-memory workload-memory-loading" aria-live="polite" aria-busy="true"><div><MetricLabel label="Allocated Model VRAM" help={MODEL_MEMORY_HELP}/><strong>{percent}%</strong></div><div className="meter"><i style={{ width: `${percent}%` }}/></div><small>{percent > 0 ? `Loading model… ${percent}%` : "Starting model load…"}</small></div>;
}

function HermesModelMemoryMetric({ value, progress, loading }: { value?: AllocatedModelMemory; progress?: number; loading: boolean }) {
  if (hasAllocatedMemory(value)) {
    const current = value.allocated_mib / 1024;
    const max = value.capacity_mib / 1024;
    const percent = Math.max(0, Math.min(100, Math.round(current / max * 100)));

    return <div className="workload-memory hermes-model-memory" aria-live="polite" aria-busy={loading}><div><MetricLabel label="Allocated Model VRAM" help={MODEL_MEMORY_HELP}/><strong>{current.toFixed(1)} GiB</strong></div><div className="meter"><i style={{ width: `${percent}%` }}/></div><small>{percent}% of {max.toFixed(1)} GiB{loading ? ` · Loading model` : ""}</small></div>;
  }
  return <LoadingModelMemoryMetric progress={progress}/>;
}

function NoteAiModelMemoryMetric({ allocatedMiB }: { allocatedMiB: number }) {
  const capacityGiB = 121.6;
  const allocatedGiB = allocatedMiB / 1024;
  const percent = Math.max(0, Math.min(100, Math.round(allocatedGiB / capacityGiB * 100)));
  return <div className="workload-memory noteai-model-memory" aria-live="polite"><div><MetricLabel label="Allocated Model VRAM" help={MODEL_MEMORY_HELP}/><strong>{allocatedGiB.toFixed(1)} GiB</strong></div><div className="meter"><i style={{ width: `${percent}%` }}/></div><small>{percent}% of 121.6 GiB Unified Memory</small></div>;
}

function ModelTransitionTelemetry({ status }: { status: NonNullable<Workload["runtime_status"]> }) {
  const incoming = status.model_transition;
  const [transition, setTransition] = useState(incoming);
  const clearTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (incoming?.status === "running" || incoming?.error?.reason) {
      if (clearTimer.current) window.clearTimeout(clearTimer.current);
      clearTimer.current = window.setTimeout(() => setTransition(incoming), 0);
      return;
    }
    clearTimer.current = window.setTimeout(() => setTransition(incoming), 1800);
    return () => { if (clearTimer.current) window.clearTimeout(clearTimer.current); };
  }, [incoming]);
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


function WorkloadFooter({ item, showLifecycle, showEndpoint }: { item: Workload; showLifecycle: boolean; showEndpoint: boolean }) {
  const endpoint = item.browser_url && item.browser_url !== "#" ? item.browser_url : "Unavailable";
  const residency = item.model_residency
    ? lifecycleLabel(item.model_residency, "residency")
    : item.shared_services?.length ? "Warm / Shared (inferred)" : "Unknown";
  return <footer className="workload-telemetry" aria-live="polite">
    <span><small>Launch estimate</small><strong>~{formatDuration(resourceLaunchEstimate(item))}</strong></span>
    {showEndpoint && <span><small>Endpoint HTTP</small><strong title={endpoint}>{endpoint}</strong></span>}
    {showLifecycle && <>
      <span className="lifecycle-detail"><small>Model resident status</small><strong>{residency}</strong></span>
      <span className="lifecycle-detail"><small>Idle retention</small><strong>Release pending confirmation</strong></span>
    </>}
  </footer>;
}

function resourceLaunchEstimate(item: Workload) {
  const modelText = item.model_names.join(" ").toLowerCase();
  const sizes = [...modelText.matchAll(/(\d+(?:\.\d+)?)\s*b/g)].map(match => Number(match[1]));
  const defaultModelSize = sizes[0] ?? 0;
  const profileEstimate = defaultModelSize >= 100 ? 900 : defaultModelSize >= 30 ? 600 : defaultModelSize >= 20 ? 420 : defaultModelSize > 0 ? 240 : 90;
  return Math.min(item.expected_cold_load_seconds, profileEstimate);
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
