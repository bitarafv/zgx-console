import type { ReactNode } from "react";
import { StatusIndicator } from "./status-indicator";
import type { SimulationState } from "../contracts";

interface SimulationHeaderProps {
  eyebrow: string;
  title: string;
  state: SimulationState;
  actions?: ReactNode;
}

export function SimulationHeader({ eyebrow, title, state, actions }: SimulationHeaderProps) {
  return <div className="flex items-center justify-between gap-4 px-5 py-3"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-blue-300">{eyebrow}</p><h2 className="mt-1 text-sm font-black">{title}</h2></div><div className="flex items-center gap-3"><StatusIndicator state={state}/>{actions}</div></div>;
}
