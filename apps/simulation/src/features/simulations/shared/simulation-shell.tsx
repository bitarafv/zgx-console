import type { ReactNode } from "react";

interface SimulationShellProps {
  header: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function SimulationShell({ header, sidebar, children, footer }: SimulationShellProps) {
  return <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#07101e] text-white shadow-2xl shadow-blue-950/30"><div className="border-b border-white/10">{header}</div><div className={`grid min-h-[500px] ${sidebar ? "md:grid-cols-[220px_1fr]" : ""}`}>{sidebar && <aside className="border-b border-white/10 bg-white/[.025] p-4 md:border-b-0 md:border-r">{sidebar}</aside>}<div className="p-5 md:p-7">{children}</div></div>{footer && <div className="border-t border-white/10 p-4">{footer}</div>}</section>;
}
