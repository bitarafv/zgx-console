"use client";
import { useEffect, useState } from "react";
type State = "checking" | "ready" | "unavailable";
export function SivaAdminFrame() {
  const [state, setState] = useState<State>("checking");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    fetch("/admin/siva/api/policy", { cache: "no-store" }).then((response) => { if (!response.ok) throw new Error(); if (active) setState("ready"); }).catch(() => { if (active) setState("unavailable"); });
    return () => { active = false; };
  }, [attempt]);
  if (state === "checking") return <section className="siva-frame-state"><span className="siva-spinner"/><h2>Connecting to MVP Dashboard</h2><p>Checking the private ZGX Nano connection…</p></section>;
  if (state === "unavailable") return <section className="siva-frame-state"><h2>MVP Dashboard is unavailable</h2><p>Start the Nano bridge with <code>./zgx start</code>, then try again.</p><button onClick={() => { setState("checking"); setAttempt((value) => value + 1); }}>Retry connection</button></section>;
  return <section className="siva-admin-shell" aria-label="ZGX Nano administration"><iframe src="/admin/siva" title="ZGX Nano administration"/></section>;
}
