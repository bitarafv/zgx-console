"use client";

import { useState } from "react";
import { Calculator, Cpu, GraduationCap, LayoutDashboard } from "lucide-react";
import { SimulationDashboard } from "./SimulationDashboard";
import { NodeDashboard } from "./NodeDashboard";
import { EnterpriseInsights } from "./EnterpriseInsights";
import { TcoCalculator } from "./TcoCalculator";

const tabs = [
  { id: "simulation", label: "Simulation Dashboard", icon: LayoutDashboard },
  { id: "node", label: "ZGX Node", icon: Cpu },
  { id: "insights", label: "Enterprise AI Insights", icon: GraduationCap },
  { id: "tco", label: "TCO Calculator", icon: Calculator },
] as const;
type TabId = typeof tabs[number]["id"];

export function ConsoleShell() {
  const [tab, setTab] = useState<TabId>("simulation");
  function select(id: TabId) { setTab(id); window.history.replaceState(null, "", `#${id}`); }
  return <main className="shell">
    <header className="topbar"><a className="brand" href="#simulation" onClick={() => select("simulation")}><span className="brand-mark">Z</span><span><strong>ZGX Console</strong><small>Personal AI infrastructure</small></span></a><span className="nano-pill"><i /> ZGX Nano online</span></header>
    <nav className="tabs" aria-label="Console sections">{tabs.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => select(item.id)} aria-current={tab === item.id ? "page" : undefined}><item.icon size={17} /><span>{item.label}</span></button>)}</nav>
    <section className="page" key={tab}>{tab === "simulation" && <SimulationDashboard />}{tab === "node" && <NodeDashboard />}{tab === "insights" && <EnterpriseInsights />}{tab === "tco" && <TcoCalculator />}</section>
  </main>;
}

