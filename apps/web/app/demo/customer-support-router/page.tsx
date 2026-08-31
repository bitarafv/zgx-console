"use client";

import { useState } from "react";
import { DemoAccessModal } from "@/components/DemoAccessModal";
import styles from "./styles.module.css";

export default function SupportRouterDemoPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const requestLiveAccess = () => setModalOpen(true);
  return <main className={styles.shell}>
    <div className={styles.demoBar}><b>INTERACTIVE SANDBOX DEMO</b><span>Production interface preview · local AI models are offline · no ticket data leaves this page</span></div>
    <header><div className={styles.brand}><span>SR</span><div><strong>Support Router</strong><small>LOCAL ENTERPRISE AI</small></div></div><div className={styles.status}><i/>DEMO · MODELS OFFLINE</div></header>
    <section className={styles.hero}>
      <div><p className={styles.eyebrow}>CUSTOMER OPERATIONS</p><h1>Route quickly.<br/><em>Troubleshoot with depth.</em></h1><p>Explore the same ticket workspace used in production. Live classification, retrieval, and response controls open access scheduling.</p></div>
      <div className={styles.models}><p className={styles.eyebrow}>LOCAL MODEL STACK</p><article><span>EXPRESS</span><strong>Llama 3 70B Instruct</strong><small>Q4_K_M · offline</small></article><article><span>PREMIUM</span><strong>Llama 3 8B Instruct</strong><small>FP16 · offline</small></article><article><span>RETRIEVAL</span><strong>BGE Large EN v1.5</strong><small>CUDA · offline</small></article></div>
    </section>
    <section className={styles.workspace}>
      <article className={styles.ticket}>
        <div className={styles.heading}><div><p className={styles.eyebrow}>NEW REQUEST</p><h2>Route a support ticket</h2></div><span>ZERO EGRESS</span></div>
        <div className={styles.fields}><label>Account ID<input defaultValue="acme-enterprise"/></label><label>Customer tier<select defaultValue="vip"><option>Standard</option><option>VIP</option></select></label><label className={styles.wide}>Subject<input defaultValue="Production SSO login failure"/></label><label className={styles.wide}>Ticket details<textarea defaultValue="P1: Users cannot sign in after our SAML certificate rotation. Production access is blocked."/></label></div>
        <button className={styles.ai} onClick={requestLiveAccess}><span>✦</span> Route with local AI <b>→</b></button><small className={styles.note}>Preview fields stay in this browser. No API or inference request is made.</small>
      </article>
      <aside><p className={styles.eyebrow}>LIVE ROUTE</p><div className={styles.empty}><span>READY</span><h3>Awaiting live model access</h3><p>The production policy classifies tier, severity, category, and SLA before account-scoped retrieval and local inference.</p><button onClick={requestLiveAccess}>Book live access</button></div></aside>
    </section>
    <section className={styles.policy}><div><p className={styles.eyebrow}>ROUTING POLICY</p><h2>Deterministic first. Generative second.</h2></div><ol><li><b>01</b><span><strong>Classify</strong><small>Tier, severity, category, SLA</small></span></li><li><b>02</b><span><strong>Retrieve</strong><small>Account-scoped local context</small></span></li><li><b>03</b><span><strong>Respond</strong><small>Selected local engine</small></span></li></ol></section>
    {modalOpen && <DemoAccessModal workloadId="customer-support-router" workloadName="Enterprise Support Router" onClose={() => setModalOpen(false)}/>}
  </main>;
}
