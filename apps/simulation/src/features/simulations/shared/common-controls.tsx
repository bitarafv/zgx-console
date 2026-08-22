import { Play, RefreshCcw } from "lucide-react";

export function ResetControl({ onReset }: { onReset: () => void }) {
  return <button type="button" onClick={onReset} className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/5"><RefreshCcw size={13}/> Reset</button>;
}

export function PrimarySimulationAction({ label, onClick, disabled = false }: { label: string; onClick: () => void; disabled?: boolean }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"><Play size={16}/>{label}</button>;
}
