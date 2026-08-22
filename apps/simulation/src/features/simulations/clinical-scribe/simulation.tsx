"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Clipboard, FileText, Mic, Pause, Play, RotateCcw, ShieldCheck, TriangleAlert } from "lucide-react";
import type { SimulationProps } from "../contracts";
import { SimulationShell } from "../shared/simulation-shell";
import { SimulationHeader } from "../shared/simulation-header";
import { ResetControl } from "../shared/common-controls";
import { generationStages, notes, patient, templateLabels, transcript, type TemplateId } from "./mock-data";

type Phase = "initial" | "listening" | "paused" | "transcribing" | "generating" | "success" | "empty" | "error";

const contractState = (phase: Phase) => phase === "initial" ? "initial" : phase === "success" ? "success" : phase === "empty" ? "empty" : phase === "error" ? "error" : "processing";

export function ClinicalScribeSimulation({ demo }: SimulationProps) {
  const [phase, setPhase] = useState<Phase>("initial");
  const [visibleLines, setVisibleLines] = useState(0);
  const [template, setTemplate] = useState<TemplateId>("soap");
  const [activeTab, setActiveTab] = useState<"transcript" | "note">("transcript");
  const [draft, setDraft] = useState("");
  const [stage, setStage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [failNext, setFailNext] = useState(false);
  const timer = useRef<number | null>(null);

  const clearTimer = () => { if (timer.current !== null) window.clearTimeout(timer.current); timer.current = null; };
  useEffect(() => clearTimer, []);

  useEffect(() => {
    clearTimer();
    if (phase === "listening" && visibleLines < transcript.length) {
      timer.current = window.setTimeout(() => setVisibleLines((value) => value + 1), 550);
    } else if (phase === "listening" && visibleLines === transcript.length) {
      timer.current = window.setTimeout(() => setPhase("transcribing"), 100);
    } else if (phase === "transcribing") {
      timer.current = window.setTimeout(() => setPhase("paused"), 500);
    }
    return clearTimer;
  }, [phase, visibleLines]);

  useEffect(() => {
    if (phase !== "generating") return;
    clearTimer();
    if (failNext && stage === 1) {
      timer.current = window.setTimeout(() => { setPhase("error"); setFailNext(false); }, 450);
    } else if (stage < generationStages.length - 1) {
      timer.current = window.setTimeout(() => setStage((value) => value + 1), 450);
    } else {
      timer.current = window.setTimeout(() => { setDraft(notes[template]); setPhase("success"); setActiveTab("note"); }, 450);
    }
    return clearTimer;
  }, [phase, stage, template, failNext]);

  const elapsed = useMemo(() => visibleLines ? transcript[Math.min(visibleLines, transcript.length) - 1].timestamp : "00:00", [visibleLines]);
  const reset = () => { clearTimer(); setPhase("initial"); setVisibleLines(0); setTemplate("soap"); setActiveTab("transcript"); setDraft(""); setStage(0); setCopied(false); setFailNext(false); };
  const start = () => setPhase("listening");
  const finish = () => { clearTimer(); setPhase(visibleLines === 0 ? "empty" : "paused"); };
  const generate = () => { if (visibleLines === 0) { setPhase("empty"); return; } setStage(0); setPhase("generating"); };
  const chooseTemplate = (next: TemplateId) => { setTemplate(next); if (phase === "success") setDraft(notes[next]); };
  const copy = async () => { if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(draft); setCopied(true); };

  const sidebar = <div className="space-y-5">
    <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Encounter</p><p className="mt-2 text-sm font-bold">{patient.name}</p><p className="mt-1 text-xs leading-5 text-slate-400">Age {patient.age} · {patient.pronouns}<br/>{patient.encounter}</p></div>
    <div className="rounded-xl border border-white/10 bg-white/[.03] p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Local boundary</p><p className="mt-2 text-xs leading-5 text-slate-300">Deterministic mock data<br/>No microphone or AI service</p></div>
    <label className="block text-xs font-bold text-slate-300">Consultation template<select aria-label="Consultation template" value={template} onChange={(event) => chooseTemplate(event.target.value as TemplateId)} className="mt-2 w-full rounded-lg border border-white/10 bg-[#101b2b] px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-blue-400">{Object.entries(templateLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Demo scenarios</p><div className="mt-2 space-y-1"><button type="button" onClick={() => { clearTimer(); setVisibleLines(0); setPhase("empty"); }} className="w-full rounded-lg px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-blue-400">Show empty transcript</button><button type="button" onClick={() => setFailNext(true)} aria-pressed={failNext} className="w-full rounded-lg px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-blue-400">{failNext ? "Error armed" : "Simulate next error"}</button></div></div>
  </div>;

  return <SimulationShell
    header={<SimulationHeader eyebrow="ZGX Nano · Healthcare" title={`${demo.name} Workspace`} state={contractState(phase)} actions={<ResetControl onReset={reset}/>}/>} sidebar={sidebar}
    footer={<div className="flex items-center gap-2 text-xs text-slate-400"><ShieldCheck size={14} className="text-emerald-400"/> Drafts require clinician verification and approval before use.</div>}
  >
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4">
        <div className="flex items-center gap-3"><span className={`grid size-10 place-items-center rounded-full ${phase === "listening" ? "bg-red-400/15 text-red-300" : "bg-blue-400/10 text-blue-300"}`}><Mic size={18}/></span><div><p className="text-sm font-bold">Consultation capture</p><p aria-label="Elapsed time" className="font-mono text-xs text-slate-400">{elapsed} · {phaseLabel(phase)}</p></div></div>
        <div className="flex flex-wrap gap-2">
          {phase === "initial" && <Action onClick={start} icon={<Play size={15}/>} label="Start consultation"/>}
          {phase === "listening" && <><Action onClick={() => setPhase("paused")} icon={<Pause size={15}/>} label="Pause" secondary/><Action onClick={finish} icon={<Check size={15}/>} label="Finish consultation"/></>}
          {phase === "paused" && <><Action onClick={() => setPhase("listening")} icon={<Play size={15}/>} label="Resume" secondary/><Action onClick={generate} icon={<FileText size={15}/>} label="Generate note"/></>}
          {phase === "empty" && <Action onClick={reset} icon={<RotateCcw size={15}/>} label="Start over"/>}
          {phase === "error" && <Action onClick={generate} icon={<RotateCcw size={15}/>} label="Retry generation"/>}
        </div>
      </div>

      <div className="flex border-b border-white/10" role="tablist" aria-label="Encounter workspace">
        {(["transcript", "note"] as const).map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`border-b-2 px-4 py-3 text-xs font-bold capitalize focus-visible:ring-2 focus-visible:ring-blue-400 ${activeTab === tab ? "border-blue-400 text-blue-300" : "border-transparent text-slate-400"}`}>{tab}</button>)}
      </div>

      {phase === "generating" && <div role="status" className="rounded-2xl border border-blue-400/20 bg-blue-400/5 p-5"><p className="text-sm font-bold">Generating draft note</p><div className="mt-4 grid gap-2 sm:grid-cols-3">{generationStages.map((item, index) => <div key={item} className={`rounded-lg border p-3 text-xs ${index <= stage ? "border-blue-400/40 bg-blue-400/10 text-blue-200" : "border-white/10 text-slate-500"}`}>{index < stage ? "✓ " : index === stage ? "• " : ""}{item}</div>)}</div></div>}
      {phase === "error" && <Message icon={<TriangleAlert size={19}/>} title="Draft generation was interrupted" body="This is a simulated processing error. The transcript is intact; retry safely when ready." tone="red"/>}
      {phase === "empty" && <Message icon={<FileText size={19}/>} title="No transcript to summarize" body="Start a consultation and capture at least one dialogue line before generating a note." tone="slate"/>}

      {activeTab === "transcript" ? <section aria-label="Live transcript" aria-live="polite" className="min-h-64 space-y-3 rounded-2xl border border-white/10 bg-black/10 p-4">
        {visibleLines === 0 ? <div className="grid min-h-52 place-items-center text-center"><div><Mic className="mx-auto text-slate-600"/><p className="mt-3 text-sm font-bold text-slate-300">Transcript ready</p><p className="mt-1 text-xs text-slate-500">Dialogue will appear here as the simulation runs.</p></div></div> : transcript.slice(0, visibleLines).map((line) => <article key={line.timestamp} className="grid gap-2 rounded-xl border border-white/8 bg-white/[.025] p-3 sm:grid-cols-[78px_1fr]"><div><p className={`text-xs font-bold ${line.speaker.startsWith("Dr.") ? "text-blue-300" : "text-emerald-300"}`}>{line.speaker}</p><time className="text-[10px] text-slate-500">{line.timestamp}</time></div><p className="text-sm leading-6 text-slate-200">{line.text}</p></article>)}
      </section> : <section aria-label="Draft consultation note" className="rounded-2xl border border-white/10 bg-white/[.025] p-4">
        {draft ? <><div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-sm font-bold">{templateLabels[template]}</p><p className="text-xs text-amber-300">Clinician review required</p></div><button type="button" onClick={copy} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-blue-400"><Clipboard size={14}/>{copied ? "Copied" : "Copy note"}</button></div><label className="sr-only" htmlFor="clinical-note">Editable clinical note</label><textarea id="clinical-note" aria-label="Editable clinical note" value={draft} onChange={(event) => setDraft(event.target.value)} className="min-h-[390px] w-full resize-y rounded-xl border border-white/10 bg-[#0a1422] p-4 font-mono text-xs leading-6 text-slate-200 outline-none focus:ring-2 focus:ring-blue-400"/></> : <div className="grid min-h-64 place-items-center text-center text-sm text-slate-500">Finish the encounter, then generate a draft note.</div>}
      </section>}
    </div>
  </SimulationShell>;
}

function phaseLabel(phase: Phase) { return ({ initial: "Ready", listening: "Listening", paused: "Paused", transcribing: "Finalizing transcript", generating: "Generating note", success: "Draft ready", empty: "Empty transcript", error: "Processing error" })[phase]; }
function Action({ onClick, icon, label, secondary = false }: { onClick: () => void; icon: React.ReactNode; label: string; secondary?: boolean }) { return <button type="button" onClick={onClick} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold focus-visible:ring-2 focus-visible:ring-blue-400 ${secondary ? "border border-white/10 text-slate-200 hover:bg-white/5" : "bg-blue-600 text-white hover:bg-blue-500"}`}>{icon}{label}</button>; }
function Message({ icon, title, body, tone }: { icon: React.ReactNode; title: string; body: string; tone: "red" | "slate" }) { return <div role="alert" className={`flex gap-3 rounded-2xl border p-4 ${tone === "red" ? "border-red-400/20 bg-red-400/5" : "border-white/10 bg-white/[.025]"}`}><span className={tone === "red" ? "text-red-300" : "text-slate-400"}>{icon}</span><div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{body}</p></div></div>; }
