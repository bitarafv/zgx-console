"use client";

import { useState } from "react";
import { DemoAccessModal } from "@/components/DemoAccessModal";
import styles from "./styles.module.css";

const findings = [
  { policy: "Security notification", clause: "Article 7 · 72 hours", status: "NONCOMPLIANT", risk: "HIGH", why: "Policy requires notice within 24 hours; the fictional contract allows 72 hours.", cite: "Security Policy §1.1 · Orion Agreement Art. 7" },
  { policy: "Liability carve-outs", clause: "Article 8 · fees paid", status: "NONCOMPLIANT", risk: "HIGH", why: "Required confidentiality and data-protection carve-outs are missing.", cite: "Contracting Policy §4.1 · Orion Agreement Art. 8" },
  { policy: "Governing law", clause: "Article 9 · California", status: "NONCOMPLIANT", risk: "MEDIUM", why: "Corporate policy requires Delaware governing law.", cite: "Contracting Policy §5.1 · Orion Agreement Art. 9" },
  { policy: "Data retention", clause: "Article 11 · 90 days", status: "NONCOMPLIANT", risk: "MEDIUM", why: "Corporate policy requires deletion within 30 days.", cite: "Security Policy §2.1 · Orion Agreement Art. 11" },
] as const;

type Tab = "audit" | "evidence" | "models";

export default function LegalDemo() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("audit");
  const book = () => setBookingOpen(true);

  return <main className={styles.shell}>
    <div className={styles.demoBanner} role="status">
      <b>DEMO · FICTIONAL DATA</b>
      <span>MODELS OFFLINE · NO PRODUCTION INFERENCE</span>
    </div>
    <header>
      <div><strong>ZG / CONTRACT AUDITOR</strong><small>PRIVATE EVIDENCE WORKSPACE</small></div>
      <span>DEMO · MODELS OFFLINE</span>
    </header>
    <section className={styles.hero}>
      <div><p>CONTRACT INTELLIGENCE</p><h1>Every finding,<br/><em>tied to evidence.</em></h1><span>Explore a fictional policy-to-contract audit. Nothing shown is a real document or legal conclusion.</span></div>
      <aside><b>Not legal advice</b><span>Automated findings require review by qualified counsel.</span></aside>
    </section>
    <nav aria-label="Demo workspace">
      {(["audit", "evidence", "models"] as const).map(value =>
        <button data-demo-browse className={tab === value ? styles.active : ""} onClick={() => setTab(value)} key={value}>{value}</button>
      )}
    </nav>

    {tab === "audit" && <section className={styles.workspace}>
      <aside>
        <h2>Fictional document set</h2>
        <label>CONTRACT<strong>Orion Services Agreement</strong><small>12 clauses · synthetic</small></label>
        <label>POLICIES<strong>Acme Security + Contracting</strong><small>6 requirements · synthetic</small></label>
        <button data-ai-action onClick={book}>Run contract audit</button>
        <button data-ai-action onClick={book}>Upload documents</button>
        <button data-ai-action className={styles.quiet} onClick={book}>Export structured JSON</button>
        <button data-ai-action className={styles.quiet} onClick={book}>Generate audit report</button>
      </aside>
      <div>
        <div className={styles.sectionHead}><div><p>DISCREPANCY MATRIX</p><h2>Policy-to-contract findings</h2></div><span>PRECISION ENGINE · PRECOMPUTED</span></div>
        <div className={styles.findings}>{findings.map(finding =>
          <article key={finding.policy}>
            <header><span>{finding.status}</span><b>{finding.risk}</b></header>
            <h3>{finding.policy}</h3><strong>{finding.clause}</strong><p>{finding.why}</p>
            <button data-demo-browse className={styles.citation} onClick={() => setTab("evidence")}>{finding.cite}</button>
          </article>
        )}</div>
        <section className={styles.ask}>
          <div><p>GROUNDED Q&amp;A</p><h2>Ask the indexed documents</h2></div>
          <input aria-label="Demo question" readOnly value="What does the agreement say about incident notification?"/>
          <button data-ai-action onClick={book}>Ask with citations</button>
          <small>Questions require a live model session. This demo never sends the prompt.</small>
        </section>
      </div>
    </section>}

    {tab === "evidence" && <section className={styles.panel}>
      <div className={styles.sectionHead}><div><p>RETRIEVED EVIDENCE</p><h2>Clauses behind each conclusion</h2></div><span>STABLE FICTIONAL REFERENCES</span></div>
      {findings.map(finding => <article key={finding.policy}><b>{finding.cite}</b><p>{finding.why}</p><small>Stable fictional evidence reference · page 1</small></article>)}
    </section>}

    {tab === "models" && <section className={styles.models}>
      <article><span>FAST ENGINE · OFFLINE</span><h2>Nemotron Mini 4B</h2><b>Routing · extraction · factual Q&amp;A</b></article>
      <article><span>PRECISION ENGINE · OFFLINE</span><h2>Llama 3.1 Nemotron 70B</h2><b>Policy conflicts · remediation · reports</b></article>
      <p>Benchmark content is a deterministic synthetic engineering baseline and does not establish legal reliability.</p>
      <button data-ai-action onClick={book}>Compare live models</button>
      <button data-ai-action className={styles.quiet} onClick={book}>Access live models</button>
    </section>}

    <footer>DEMO · FICTIONAL SYNTHETIC DATA · MODELS OFFLINE · NO UPLOADS OR PRODUCTION CALLS</footer>
    {bookingOpen && <DemoAccessModal workloadId="rag-legal-auditor" workloadName="Contract & Legal Auditor" onClose={() => setBookingOpen(false)}/>}
  </main>;
}
