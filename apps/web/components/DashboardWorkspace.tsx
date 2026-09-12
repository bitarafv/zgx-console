"use client";
import { Component, useState, type ReactNode } from "react";
import Link from "next/link";
import { NodeDashboard } from "./NodeDashboard";
import { SivaAdminFrame } from "./SivaAdminFrame";
import { NodeObservatory } from "./NodeObservatory";
import { useDashboardOptions } from "./useDashboardOptions";
import styles from "./NodeObservatory.module.css";

/** Presentation failure must not remove access to the untouched original. */
class ObservatoryBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function DashboardWorkspace({ adminView = false, monitorOnly = false }: { adminView?: boolean; monitorOnly?: boolean }) {
  const { options, update } = useDashboardOptions();
  const [attempt, setAttempt] = useState(0);
  const disabled = process.env.NEXT_PUBLIC_ZGX_DASHBOARD_V2 === "false";
  const restore = () => update({ view: "classic" });
  const classic = <div className={monitorOnly ? styles.classicMonitor : undefined}>
    <div className={styles.classicToolbar}><span>Classic dashboard · original implementation</span>
      {!disabled && <button onClick={() => { setAttempt(value => value + 1); update({ view: "observatory" }); }}>Use redesigned dashboard</button>}
      {monitorOnly && <Link href="/?dashboard=classic#node">Back to console</Link>}
    </div>
    {adminView && !monitorOnly ? <SivaAdminFrame/> : <NodeDashboard/>}
  </div>;
  if (disabled || options.view === "classic") return classic;
  return <ObservatoryBoundary key={attempt} fallback={<><p role="alert">The redesigned view could not render. Your original dashboard is available below.</p>{classic}</>}>
    <NodeObservatory adminView={adminView} monitorOnly={monitorOnly} onClassic={restore}/>
  </ObservatoryBoundary>;
}
