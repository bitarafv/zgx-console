"use client";

import { useState } from "react";
import styles from "./styles.module.css";

type DemoTransaction = { id: string; sender: string; receiver: string; amount: number; flag: string; risk: number; escalate: boolean };
const transactions: DemoTransaction[] = [
  { id: "tx-1041", sender: "Northstar Foods", receiver: "Metro Supply", amount: 1840, flag: "NORMAL_ACTIVITY", risk: 0.08, escalate: false },
  { id: "tx-1042", sender: "ACC-771", receiver: "Harbor Holdings", amount: 9800, flag: "STRUCTURING_SUSPECTED", risk: 0.82, escalate: true },
  { id: "tx-1043", sender: "ACC-772", receiver: "Harbor Holdings", amount: 9700, flag: "STRUCTURING_SUSPECTED", risk: 0.87, escalate: true },
  { id: "tx-1044", sender: "Harbor Holdings", receiver: "Orchid Imports", amount: 19450, flag: "RAPID_VELOCITY", risk: 0.91, escalate: true },
  { id: "tx-1045", sender: "Westline Services", receiver: "Payroll Clearing", amount: 4260, flag: "NORMAL_ACTIVITY", risk: 0.12, escalate: false },
];
const sar = "Between 09:14 and 09:27 UTC, related accounts ACC-771 and ACC-772 sent two payments of $9,800 and $9,700 to Harbor Holdings. The aggregate account moved $19,450 to Orchid Imports within four minutes. The repeated sub-$10,000 values, common beneficiary, and rapid onward transfer are consistent with structuring and layering indicators. Enhanced due diligence and human review for a Suspicious Activity Report are recommended.";

export default function AmlDemoPage() {
  const [processed, setProcessed] = useState<DemoTransaction[]>([]);
  const [running, setRunning] = useState(false);
  const [selected, setSelected] = useState(false);
  const [review, setReview] = useState<"pending" | "approved" | "filed">("pending");
  const suspicious = processed.filter(item => item.escalate);

  async function stream() {
    if (running) return;
    setProcessed([]); setSelected(false); setReview("pending"); setRunning(true);
    for (const item of transactions) {
      await new Promise(resolve => window.setTimeout(resolve, 420));
      setProcessed(current => [...current, item]);
    }
    setRunning(false); setSelected(true);
  }

  function reset() { setProcessed([]); setSelected(false); setReview("pending"); setRunning(false); }

  return <main className={styles.shell}>
    <div className={styles.demoBar}><b>SIMULATION</b><span>No AI model · no node connection · browser-only session</span></div>
    <header><div><strong>SIVA / AML</strong><span>SOVEREIGN FINANCIAL CRIME OPERATIONS</span></div><div className={styles.status}><i/>DETERMINISTIC DEMO</div></header>
    <section className={styles.hero}><div><p className={styles.eyebrow}>MODEL-FREE INTERACTIVE PREVIEW</p><h1>Transaction intelligence.<br/><em>Kept in this browser.</em></h1><p>Explore deterministic screening, escalation, case review, and a review-only SAR narrative without loading an AI model.</p></div><div className={styles.heroActions}><button onClick={() => void stream()} disabled={running}>{running ? "Streaming…" : processed.length ? "Run again" : "Stream structuring demo"}</button><button className={styles.secondary} onClick={reset}>Reset</button></div></section>
    <section className={styles.stats}><div><span>TRANSACTIONS</span><strong>{processed.length}</strong></div><div><span>ESCALATIONS</span><strong>{suspicious.length}</strong></div><div><span>OPEN CASES</span><strong>{suspicious.length ? 1 : 0}</strong></div><div><span>ENGINE</span><strong className={styles.small}>RULES ONLY</strong></div></section>
    <section className={styles.grid}>
      <article><div className={styles.heading}><div><p className={styles.eyebrow}>LIVE LEDGER STREAM</p><h2>Transaction triage</h2></div><span>{running ? "Processing" : "Ready"}</span></div><div className={styles.feed}>{processed.length ? processed.map(item => <button key={item.id} className={item.escalate ? styles.alert : ""} onClick={() => item.escalate && setSelected(true)}><span><b>{item.flag.replaceAll("_", " ")}</b><small>{item.id} · {item.sender} → {item.receiver}</small></span><strong>${item.amount.toLocaleString()}</strong><em>{item.risk.toFixed(2)}</em></button>) : <p className={styles.empty}>Start the stream to process five representative ledger events.</p>}</div></article>
      <article className={styles.case}><p className={styles.eyebrow}>CASE WORKSPACE</p>{selected && suspicious.length ? <><div className={styles.caseTitle}><div><h2>CASE-STRUCT-204</h2><p>Harbor Holdings · STRUCTURING + RAPID MOVEMENT</p></div><strong>0.91</strong></div><div className={styles.chips}><span>{review}</span><span>4 linked entities</span><span>{suspicious.length} flagged transfers</span></div><label>SAR narrative · deterministic template</label><textarea readOnly value={sar}/><div className={styles.actions}><button onClick={() => setReview("approved")}>Approve draft</button><button onClick={() => setReview("filed")}>Mark filed</button><button className={styles.secondary} onClick={() => setSelected(false)}>Close case</button></div></> : <div className={styles.empty}><h2>No case selected</h2><p>A case opens after the deterministic structuring sequence is detected.</p></div>}</article>
    </section>
    <footer>Simulation values are illustrative. No inference, customer data, or regulatory filing occurs.</footer>
  </main>;
}
