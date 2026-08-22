import type { SimulationState } from "../contracts";

const labels: Record<SimulationState, string> = { initial: "Ready", processing: "Processing", success: "Complete", empty: "No results", error: "Needs attention" };
const styles: Record<SimulationState, string> = { initial: "bg-blue-400/10 text-blue-300", processing: "bg-amber-400/10 text-amber-300", success: "bg-emerald-400/10 text-emerald-300", empty: "bg-slate-400/10 text-slate-300", error: "bg-red-400/10 text-red-300" };

export function StatusIndicator({ state }: { state: SimulationState }) {
  return <span role="status" className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${styles[state]}`}>{labels[state]}</span>;
}
