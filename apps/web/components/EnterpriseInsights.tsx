"use client";

import { useState } from "react";
import { Activity, ArrowRight, Bot, Building2, Cpu, Gauge, HardDrive, Layers3, LifeBuoy, LockKeyhole, Network, PackageCheck, RotateCcw, Server, ShieldCheck, Tags, WalletCards, Wrench } from "lucide-react";

import { trackZgxInteraction } from "@/lib/telemetry";
const chapters = [
  { id: "decision", label: "Decision guide" }, { id: "governance", label: "Security & governance" },
  { id: "infrastructure", label: "Infrastructure & scale" }, { id: "manageability", label: "Manageability" },
  { id: "costs", label: "Costs & support" },
] as const;
type Chapter = typeof chapters[number]["id"];

const governanceControls = [
  { icon: LockKeyhole, title: "Identity & access", text: "Integrate named administrators, role-based access, SSH key policy, least privilege, and management-plane network controls." },
  { icon: ShieldCheck, title: "Security baseline", text: "Standardize DGX OS or the supported HP image, patch cadence, UEFI policy, TPM use, encrypted storage, logging, and recovery media." },
  { icon: PackageCheck, title: "Models", text: "Allowlist model IDs and versions; record source, license, digest, scan results, approver, deployment owner, and retirement date." },
  { icon: Layers3, title: "Software & containers", text: "Approve ARM64-compatible packages and images, trusted registries, signatures, SBOMs, CUDA requirements, privileges, and network egress." },
  { icon: Activity, title: "Compliance evidence", text: "Map technical controls to the customer framework and retain inventory, change, access, inference, incident, and disposition evidence." },
];

const fleetLifecycle = [
  { icon: Tags, title: "Procure", text: "Record SKU, entitlement, asset identity, owner, and CMDB relationship." },
  { icon: ShieldCheck, title: "Provision", text: "Apply users, SSH keys, network, certificates, packages, and policy at first boot." },
  { icon: Activity, title: "Monitor", text: "Collect health, inventory, firmware, and drift evidence into existing operations tools." },
  { icon: Wrench, title: "Maintain", text: "Stage OS, driver, and firmware updates through approved rings and maintenance windows." },
  { icon: Gauge, title: "Respond", text: "Run targeted diagnostics first; retrieve deeper evidence bundles only for escalation." },
  { icon: RotateCcw, title: "Retire", text: "Reset, wipe, offboard, and retain disposition evidence under customer policy." },
];

export function EnterpriseInsights() {
  const [chapter, setChapter] = useState<Chapter>("decision");
  return <>
    <div className="hero compact insight-hero"><div><p className="eyebrow">ENTERPRISE AI INSIGHTS</p><h1>Answers for bringing <span>ZGX into the enterprise</span></h1><p>A practical buyer guide to security, governance, compatibility, facilities, cost, fleet operations, and support.</p></div><div className="insight-orbit"><Bot /><span>Evaluate</span><span>Govern</span><span>Operate</span></div></div>
    <nav className="chapter-nav" aria-label="Insight chapters">{chapters.map((item) => <button key={item.id} className={chapter === item.id ? "active" : ""} onClick={() => {setChapter(item.id);trackZgxInteraction("Enterprise AI Insights","insight_chapter",item.id,item.label)}}>{item.label}</button>)}</nav>
    {chapter === "decision" && <DecisionGuide />}{chapter === "governance" && <Governance />}{chapter === "infrastructure" && <Infrastructure />}{chapter === "manageability" && <Manageability />}{chapter === "costs" && <CostsSupport />}
    <p className="source-note">Product availability, specifications, licensing, warranty, and support vary by configuration and region. Validate the final HP quote, QuickSpecs, software entitlements, workload compatibility, and site design before purchase.</p>
  </>;
}

function DecisionGuide() { return <div className="buyer-guide">
  <div className="section-head insight-heading"><div><p className="eyebrow">START WITH THE OPERATING MODEL</p><h2>Nano for individual development. Fury for departmental production.</h2></div><p>Choose against validated workloads, users, latency, data, and support needs—not parameter count alone.</p></div>
  <div className="platform-compare">
    <article><div className="platform-label"><Cpu/><span>HP ZGX Nano G1n</span></div><h3>Compact AI development system</h3><dl><Fact label="Best fit" value="Experimentation, prototyping, fine-tuning, and local inference"/><Fact label="Memory" value="128 GB coherent unified memory"/><Fact label="OS & CPU" value="NVIDIA DGX OS 7 / Ubuntu 24.04 on Arm; Windows is not supported"/><Fact label="Placement" value="15 cm mini desktop; 240 W external power adapter"/><Fact label="Scale point" value="One system supports models up to 200B; HP documents up to 405B with two connected systems"/></dl></article>
    <article><div className="platform-label fury"><Server/><span>HP ZGX Fury</span></div><h3>Departmental AI development and production</h3><dl><Fact label="Best fit" value="Advanced fine-tuning, production inference, agents, and concurrent users"/><Fact label="Memory" value="748 GB coherent memory on NVIDIA GB300 Grace Blackwell Ultra"/><Fact label="OS status" value="HP currently lists Ubuntu with NVIDIA AI developer tools; Windows support is planned, not current"/><Fact label="Placement" value="Deskside and described by HP as rack-ready; confirm the supported rack design in the final BOM"/><Fact label="Availability" value="Confirm region, order status, specifications, and delivery date with HP"/></dl></article>
  </div>
  <div className="fit-gates"><article><strong>Choose Nano when</strong><p>One developer or a small team needs private, immediate capacity and the workload fits its memory, Arm software stack, and concurrency envelope.</p></article><article><strong>Choose Fury when</strong><p>A department needs larger models, more simultaneous users, or a production serving tier without building a conventional GPU data center.</p></article><article><strong>Pause for architecture review when</strong><p>The application requires Windows today, x86-only binaries, GPU-passthrough virtualization, certified ISV support, HA, multi-node scheduling, or a regulated production control not yet designed.</p></article></div>
  <SourceLinks links={[["HP Z AI Stations","https://www.hp.com/us-en/workstations/ai-stations.html"],["HP ZGX Nano specifications","https://support.hp.com/us-en/document/ish_13212147-13212192-16"]]}/>
</div>; }

function Governance() { return <div className="buyer-guide">
  <div className="section-head insight-heading"><div><p className="eyebrow">SECURITY IS AN OPERATING MODEL</p><h2>Local processing improves control. It does not create compliance by itself.</h2></div><p>Security and compliance depend on the full application, model, identity, network, update, and evidence design.</p></div>
  <div className="truth-banner"><ShieldCheck/><div><strong>What “data stays local” should mean</strong><p>Inference data remains inside the approved environment only when applications, models, telemetry, package sources, and integrations are configured not to send it elsewhere. Verify egress rather than relying on the hardware location.</p></div></div>
  <div className="governance-grid">{governanceControls.map((item) => <article key={item.title}><item.icon/><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
  <section className="control-workflow"><div><p className="eyebrow">MODEL AND SOFTWARE PROMOTION</p><h3>Make installation a governed pipeline</h3></div><ol>{["Request","License & provenance","Security scan","Technical validation","Approval","Deploy by digest","Monitor & retire"].map((item,index)=><li key={item}><span>{index+1}</span>{item}</li>)}</ol></section>
  <div className="answer-table"><div><strong>Does ZGX make us compliant?</strong><p>No. It can support data residency and technical controls, but the customer must map, validate, document, and operate the controls required by its framework.</p></div><div><strong>Can users install anything?</strong><p>Technically it is a Linux AI system; enterprise policy should limit installations to approved Arm-compatible packages, containers, models, and repositories.</p></div><div><strong>Who decides which models run?</strong><p>The customer. Use an allowlist and registry workflow; do not let model discovery or developer access become automatic production approval.</p></div></div>
  <SourceLinks links={[["DGX OS security and compliance","https://docs.nvidia.com/dgx/dgx-spark/dgx-os.html"],["NVIDIA software terms","https://docs.nvidia.com/dgx/dgx-spark/eula.html"]]}/>
</div>; }

function Infrastructure() { return <div className="buyer-guide">
  <div className="section-head insight-heading"><div><p className="eyebrow">FACILITIES AND INTEGRATION</p><h2>Resolve placement, power, network, and software fit before ordering.</h2></div><p>Published capability is a starting point; the final BOM and site design are the acceptance baseline.</p></div>
  <div className="infrastructure-grid">
    <article><Network/><h3>How does it scale?</h3><p>Nano can connect two systems over high-speed QSFP for supported larger-model workflows. Fury targets multi-user departmental serving. More devices do not automatically become one service: define routing, scheduling, storage, identity, monitoring, failure handling, and capacity policy.</p></article>
    <article><Gauge/><h3>What is the power demand?</h3><p>Nano ships with a 240 W adapter; that rating is not a promise of constant consumption. HP has not published a final Fury input-power, heat, or acoustic figure on the cited product page. Require measured workload draw and final QuickSpecs before electrical or cooling approval.</p></article>
    <article><Server/><h3>Can it be racked?</h3><p>Nano is a mini desktop. HP describes its AI Station approach as rack-ready, but rack shelves, density, airflow, cable management, service clearance, and remote-console design must be confirmed. Optional HP Remote System Controller adds BIOS-level KVM and virtual media on Nano, but not remote power-on.</p></article>
    <article><HardDrive/><h3>Will current software work?</h3><p>Nano is Arm64 Linux, not a Windows PC. Validate architecture, OS, CUDA and driver versions, container images, peripherals, authentication, network ports, storage, and ISV support. HP ZGX Toolkit clients can run on x86 Windows 11 or Ubuntu 24.04 with VS Code.</p></article>
  </div>
  <section className="readiness-strip"><strong>Architecture acceptance checks</strong>{["Representative model","Peak concurrent users","Latency target","Data classification","Arm64 dependencies","Network & storage","Measured power","Recovery test"].map(item=><span key={item}>{item}</span>)}</section>
  <SourceLinks links={[["HP ZGX Nano product details","https://www.hp.com/us-en/workstations/zgx-nano-ai-station.html"],["HP Z AI Stations","https://www.hp.com/us-en/workstations/ai-stations.html"]]}/>
</div>; }

function Fact({label,value}:{label:string;value:string}) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }

function SourceLinks({links}:{links:[string,string][]}) { return <div className="insight-links"><span>Official references</span>{links.map(([label,url])=><a key={url} href={url} target="_blank" rel="noreferrer">{label}<ArrowRight size={13}/></a>)}</div>; }

function Manageability() { return <div className="manageability">
  <div className="section-head insight-heading"><div><p className="eyebrow">ZGX FLEET OPERATIONS</p><h2>Manage ZGX as an enterprise endpoint—with an appliance mindset</h2></div><p>Fit each device into the tools, controls, and evidence flows IT already operates.</p></div>
  <section className="manageability-answer" aria-label="Manageability summary">
    <div><span>Recommended fleet platform</span><strong>Canonical Landscape</strong><p>Included through the Ubuntu Pro entitlement for user management, policy deployment, and controlled OS, driver, and firmware updates.</p></div>
    <div><span>Universal integration contract</span><strong>SSH + bounded JSON</strong><p>Run a focused collector or controller, ingest a small result, and pull a diagnostic artifact only when deeper evidence is needed.</p></div>
    <div><span>Safe change model</span><strong>Pilot → waves → broad</strong><p>Separate read-only collection from state-changing actions and gate updates, reboots, and remediation through approved windows.</p></div>
  </section>
  <section className="fleet-lifecycle" aria-labelledby="fleet-lifecycle-title">
    <div className="manageability-section-title"><div><p className="eyebrow">END-TO-END CONTROL</p><h3 id="fleet-lifecycle-title">One operating model across the device lifecycle</h3></div></div>
    <div>{fleetLifecycle.map((item, index) => <article key={item.title}><span>0{index + 1}</span><item.icon/><h4>{item.title}</h4><p>{item.text}</p></article>)}</div>
  </section>
  <section className="manageability-faq" aria-labelledby="manageability-faq-title">
    <div className="manageability-section-title"><div><p className="eyebrow">CUSTOMER QUESTIONS</p><h3 id="manageability-faq-title">What enterprise IT needs to know</h3></div></div>
    <div className="manageability-faq-list">
      <details open><summary>Can ZGX fit our current endpoint tools?<span>+</span></summary><p>Yes. Canonical Landscape is NVIDIA&apos;s primary recommended platform for DGX Spark. Ansible, Puppet, Tanium, and other ARM64-capable tools can cover broader fleet workflows under their vendors&apos; support. NVIDIA also publishes agentless SSH reference patterns that return machine-ingestible JSON.</p></details>
      <details><summary>Can we provision consistently or without internet access?<span>+</span></summary><p>Yes. Cloud-init can set identity, administrators, SSH keys, networking, certificates, packages, proxies, and management enrollment on first boot. Customized BaseOS or recovery media, PXE, USB delivery, and local APT or firmware mirrors support controlled and air-gapped environments.</p></details>
      <details><summary>How are OS, driver, and firmware changes controlled?<span>+</span></summary><p>DGX Dashboard is the recommended single-device update path. At fleet scale, use Landscape or the customer&apos;s orchestration platform to run prechecks, stage pilot devices, roll through waves, validate outcomes, and preserve rollback or recovery readiness.</p></details>
      <details><summary>What can operations monitor and collect?<span>+</span></summary><p>Fleet workflows can collect device identity, hardware configuration, OS build, drivers, firmware, health, reset reason, and drift posture. Keep routine output bounded for CMDB, ticketing, or SIEM ingestion; generate larger diagnostics bundles only for incident response or support escalation.</p></details>
      <details><summary>Who owns policy and governance?<span>+</span></summary><p>NVIDIA provides the DGX OS baseline, platform guidance, diagnostic patterns, and reference integrations. HP owns the hardware platform, OEM support path, and lifecycle service process. The customer owns identity and RBAC, configuration policy, approved applications, container images and models, fleet orchestration, SIEM and audit integration, change control, and evidence retention.</p></details>
      <details><summary>How do support, recovery, and retirement work?<span>+</span></summary><p>Operations can collect focused health evidence, run NVIDIA Field Diagnostic when appropriate, and attach deeper bundles to HP or NVIDIA escalations. Recovery restores the supported NVIDIA or HP OEM baseline; media and procedures are model-specific. Retirement adds customer-controlled wipe, offboarding, chain-of-custody, and disposition records.</p></details>
    </div>
  </section>
  <div className="manageability-links"><span>Official NVIDIA references</span><a href="https://docs.nvidia.com/dgx/dgx-spark/enterprise-manageability.html" target="_blank" rel="noreferrer">Enterprise manageability <ArrowRight size={13}/></a><a href="https://docs.nvidia.com/dgx/dgx-spark/os-and-component-update.html" target="_blank" rel="noreferrer">Update guidance <ArrowRight size={13}/></a></div>
</div>; }

function CostsSupport() { return <div className="buyer-guide">
  <div className="section-head insight-heading"><div><p className="eyebrow">COMMERCIAL CLARITY</p><h2>No local token meter—but not every software or service is free.</h2></div><p>Separate the hardware purchase, included components, optional subscriptions, third-party licenses, operating cost, and support coverage.</p></div>
  <div className="cost-truth">
    <article><WalletCards/><p className="eyebrow">WHAT DOES NOT ACCRUE BY DEFAULT</p><h3>Local inference has no HP or NVIDIA per-token charge</h3><p>Owning the system shifts compatible local workloads away from usage-priced cloud APIs. HP states that ZGX Toolkit is provided free of charge. Open-source models and tools still carry their own license terms.</p></article>
    <article><LifeBuoy/><p className="eyebrow">WHAT MAY RECUR</p><h3>Enterprise software and support are entitlement-based</h3><p>NVIDIA AI Enterprise—DGX Spark is a separately obtained product or evaluation; enterprise software support requires the specific DGX Spark entitlement. Third-party applications, models, management tools, extended HP services, electricity, storage, backup, and operations may also add recurring cost.</p></article>
  </div>
  <section className="responsibility-matrix"><div><Building2/><strong>HP hardware service</strong><p>Hardware warranty, repair, parts, firmware/OEM image path, optional accessories, and any purchased HP service. Coverage and response level must be confirmed by SKU, country, and contract.</p></div><div><Cpu/><strong>NVIDIA software</strong><p>DGX OS documentation, release and recovery guidance, community channels, and separately entitled NVIDIA AI Enterprise software and enterprise support.</p></div><div><ShieldCheck/><strong>Customer or integrator</strong><p>Architecture, identity, network, model and software approvals, backups, monitoring, application support, compliance evidence, change control, and operational runbooks.</p></div></section>
  <section className="commercial-checklist"><div><p className="eyebrow">PUT THESE ON THE QUOTE</p><h3>Questions that prevent surprise cost after purchase</h3></div><ul><li>Exact hardware configuration, delivery status, warranty term, response time, and repair location</li><li>Included HP software and whether updates or support have a term</li><li>Every NVIDIA entitlement: product name, quantity, start date, term, renewal, and support level</li><li>Third-party model, application, container registry, management, and security-tool licenses</li><li>Rack accessories, remote management, cables, networking, storage, backup, and power work</li><li>Deployment, integration, training, workload validation, and ongoing managed-service responsibilities</li></ul></section>
  <div className="answer-table"><div><strong>Is NVIDIA AI Enterprise mandatory?</strong><p>Not for every local development workflow. It is required when the customer chooses its enterprise software assets or wants the associated enterprise support. Confirm the intended NIM and production use against current NVIDIA terms.</p></div><div><strong>Is there a hidden subscription?</strong><p>There should not be. Require all recurring items and renewal dates on the proposal. Do not describe the entire NVIDIA software ecosystem as permanently included or free.</p></div><div><strong>Who handles a post-sales issue?</strong><p>Route hardware and OEM-image issues through the purchased HP support path; route entitled NVIDIA enterprise software through NVIDIA support; route customer applications and integrations to their named owner.</p></div></div>
  <SourceLinks links={[["HP Z AI Stations","https://www.hp.com/us-en/workstations/ai-stations.html"],["NVIDIA AI Enterprise—DGX Spark","https://docs.nvidia.com/dgx/dgx-spark/nvaie-quickstart.html"],["NVIDIA support boundaries","https://docs.nvidia.com/dgx/dgx-spark/support.html"]]}/>
</div>; }
