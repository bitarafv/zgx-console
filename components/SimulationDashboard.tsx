"use client";

import { useEffect, useState } from "react";
import { AudioLines, Bot, ScanLine, Sparkles } from "lucide-react";

const apps = [
  { name: "Meeting Intelligence", desc: "Transcribe a conversation, identify speakers, and produce decisions and actions.", icon: AudioLines, model: "Speech + reasoning", color: "violet" },
  { name: "Private Knowledge Assistant", desc: "Ask questions across local documents without sending sensitive context to a cloud model.", icon: Bot, model: "RAG + local LLM", color: "blue" },
  { name: "Vision Quality Inspector", desc: "Inspect a camera feed and surface anomalies at the edge with low latency.", icon: ScanLine, model: "Vision + detection", color: "orange" },
  { name: "Workflow Agent", desc: "Turn natural-language intent into governed multi-step actions across business tools.", icon: Sparkles, model: "Agent + tools", color: "green" },
];

export function SimulationDashboard() {
  const [running, setRunning] = useState("Meeting Intelligence");
  const [tick, setTick] = useState(0);
  useEffect(() => { const id = window.setInterval(() => setTick((n) => n + 1), 1800); return () => clearInterval(id); }, []);
  const gpu = 34 + (tick * 13) % 47;
  return <>
    <div className="hero"><div><p className="eyebrow">EXPLORE WHAT IS POSSIBLE</p><h1>Build ideas on a <span>ZGX Nano</span></h1><p>Explore representative local AI workloads without connecting to physical models. Every metric on this page is simulated.</p></div><div className="simulation-badge">SIMULATION MODE</div></div>
    <div className="metrics"><Metric label="GPU activity" value={`${gpu}%`} percent={gpu} /><Metric label="Memory bandwidth" value={`${82 + tick % 25} / 273 GB/s`} percent={40} /><Metric label="Inference" value={`${(28.2 + tick % 9).toFixed(1)} t/s`} percent={62} /><Metric label="Power" value={`${61 + tick % 18} / 140 W`} percent={49} /></div>
    <div className="section-head"><div><p className="eyebrow">REFERENCE WORKLOADS</p><h2>Choose a use case to simulate</h2></div><p>One heavy workload runs at a time.</p></div>
    <div className="app-grid">{apps.map((app) => <article className={`app-card ${running === app.name ? "running" : ""}`} key={app.name}><div className={`app-icon ${app.color}`}><app.icon /></div><div className="app-status">{running === app.name ? "ACTIVE" : "READY"}</div><h3>{app.name}</h3><p>{app.desc}</p><span className="model-chip">{app.model}</span><button onClick={() => setRunning(app.name)} disabled={running === app.name}>{running === app.name ? "Running simulation" : "Run simulation"}</button></article>)}</div>
  </>;
}

function Metric({ label, value, percent }: { label: string; value: string; percent: number }) {
  return <article className="metric"><div><span>{label}</span><strong>{value}</strong></div><div className="meter"><i style={{ width: `${percent}%` }} /></div></article>;
}

