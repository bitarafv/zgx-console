"use client";

import { useState } from "react";
import { ArrowRight, Bot, Check, ChevronDown, CircleAlert, Cpu, Download, ExternalLink, FlaskConical, Headphones, LifeBuoy, MessageCircle, Network, Send, Server, ShieldCheck, Sparkles, Wrench, X } from "lucide-react";
import { trackZgxInteraction } from "@/lib/telemetry";

const stages = [
  { id: "choose", label: "Choose", hint: "Right system" },
  { id: "secure", label: "Secure", hint: "Data & risk" },
  { id: "compatible", label: "Validate", hint: "Software fit" },
  { id: "operate", label: "Operate", hint: "Access & fleet" },
  { id: "deploy", label: "Deploy", hint: "Site & integration" },
  { id: "support", label: "Support", hint: "Ownership & SLA" },
  { id: "prove", label: "Prove", hint: "Fury pilot" },
] as const;
type Stage = typeof stages[number]["id"];
type Evidence = "confirmed" | "validate" | "pilot" | "preview";

const statusLabels: Record<Evidence,string> = {confirmed:"HP confirmed",validate:"Validate in quote",pilot:"Pilot required",preview:"Fury pre-release"};

export function EnterpriseInsights() {
  const [stage,setStage] = useState<Stage>("choose");
  const [chatOpen,setChatOpen] = useState(false);
  const current = stages.findIndex(item=>item.id===stage);
  const navigate = (next:Stage) => { setStage(next); trackZgxInteraction("Enterprise Guide","approval_stage",next); };
  return <div className="enterprise-v2">
    <header className="ev-hero">
      <div><p className="ev-overline"><span>Enterprise Guide</span><i/> Field-ready</p><h1>From first question<br/>to <em>approved deployment.</em></h1><p>Clear answers for choosing, securing, and integrating HP ZGX—built for the customer conversation.</p><button onClick={()=>navigate("choose")}>Start with the right system <ArrowRight/></button></div>
      <div className="ev-hero-card"><span>Approval path</span><strong>7</strong><p>decisions from product fit to production proof</p><div>{["Fit","Risk","IT","SLA"].map((item,index)=><i key={item} style={{animationDelay:`${index*120}ms`}}>{item}</i>)}</div></div>
    </header>
    <nav className="ev-journey" aria-label="Customer approval journey">{stages.map((item,index)=><button key={item.id} className={stage===item.id?"active":""} onClick={()=>navigate(item.id)}><b>{String(index+1).padStart(2,"0")}</b><span>{item.label}<small>{item.hint}</small></span></button>)}</nav>
    <div className="ev-legend" aria-label="Evidence maturity"><span>Evidence</span><Status type="confirmed"/><Status type="validate"/><Status type="pilot"/><Status type="preview"/></div>
    <main className="ev-stage" key={stage}>
      <div className="ev-stage-progress"><span>Step {current+1} of {stages.length}</span><i><b style={{width:`${((current+1)/stages.length)*100}%`}}/></i></div>
      {stage==="choose"&&<Choose/>}{stage==="secure"&&<Secure/>}{stage==="compatible"&&<Compatible/>}{stage==="operate"&&<Operate/>}{stage==="deploy"&&<Deploy/>}{stage==="support"&&<Support/>}{stage==="prove"&&<Prove/>}
      {current<stages.length-1&&<button className="ev-next" onClick={()=>navigate(stages[current+1].id)}>Next: {stages[current+1].label}<ArrowRight/></button>}
    </main>
    <footer className="ev-footnote">Specifications, availability, services, and entitlements vary by SKU and region. Confirm the final HP quote, current QuickSpecs, and pilot acceptance criteria before making a commitment.</footer>
    <GuideChat open={chatOpen} setOpen={setChatOpen} navigate={navigate}/>
  </div>;
}

function Choose(){return <Stage title="Choose the right system" eyebrow="Start here" answer="Start with Nano to develop and validate locally. Choose Fury when the requirement is shared departmental inference or advanced fine-tuning. Both require Arm64 software and enterprise deployment validation.">
  <div className="ev-products"><Product name="ZGX Nano G1n" icon="nano" status="Available · regional configuration varies" statusType="confirmed" role="Individual or small-team AI" specs={["GB10 · 128 GB unified memory","NVIDIA DGX OS · Arm64 Linux","Developer appliance or managed endpoint"]} gate="Software compatibility and management fit"/><Product name="ZGX Fury" icon="fury" status="Pre-order / Priority Access" statusType="preview" role="Departmental AI service" specs={["GB300 · 748 GB coherent memory","Ubuntu + NVIDIA AI Developer Tools","Shared service with production ownership"]} gate="Availability, facilities, SLA, and workload proof"/></div>
  <Callout title="Do not promise a frictionless scale-up" text="Model packaging may transfer, but serving, identity, storage, observability, and high-availability architecture can change substantially."/>
  <Sources links={[["HP Z AI Stations","https://www.hp.com/us-en/workstations/ai-stations.html"],["Nano specifications","https://support.hp.com/us-en/document/ish_13212147-13212192-16"]]}/>
</Stage>}

function Secure(){return <Stage title="Security and data governance" eyebrow="Approval gate 02" answer="‘Data stays local’ is a deployment attribute—not a complete security answer. Validate identity, egress, encryption, software provenance, patching, logging, recovery, and physical controls.">
  <Alert title="Action required · HP security bulletin" text="Some Nano systems manufactured before March 19, 2026 may contain duplicated SSH host keys. Detect affected systems and regenerate keys before deployment." href="https://support.hp.com/us-en/document/ish_14942940-14942962-16/hpsbhf04123"/>
  <ProductDetails nano={{evidence:"validate",status:"HP-confirmed controls + customer configuration",items:["TPM 2.0, Secure Boot policy, and self-encrypting storage capability","Credential, SSH-key, local-admin, segmentation, and outbound-access policy","Optional regulated configuration without Wi-Fi or Bluetooth","SIEM forwarding, backup, secure erase, media handling, and air-gap updates"]}} fury={{evidence:"preview",status:"Reference capability—not final HP implementation",items:["NVIDIA reference platform documents Secure Boot, TPM, signed firmware, BMC telemetry, web management, and Redfish","Require HP final documentation before committing to exact implementation","Define RBAC, secrets, data flows, model governance, evidence retention, and incident ownership"]}}/>
  <Sources links={[["HP security bulletin","https://support.hp.com/us-en/document/ish_14942940-14942962-16/hpsbhf04123"],["NVIDIA DGX Station stack","https://docs.nvidia.com/dgx/dgx-station-development-guide/porting/software-requirements.html"]]}/>
</Stage>}

function Compatible(){const fields=["Application + exact version","Linux Arm64 package, wheel, or image","CUDA, driver, PyTorch, TensorRT, vLLM, Triton, NCCL","Container architecture: linux/arm64 or multi-arch","ISV certification + model license","Auth, proxy, DNS, certificates, registry, NTP","Storage, database, MLOps, and monitoring","Peripherals + kernel modules"];return <Stage title="Validate the software stack" eyebrow="Approval gate 03" answer="Windows, Mac, and Linux clients can connect over the network—but Windows applications and x86-only containers do not run natively on either Arm64 ZGX platform.">
  <div className="ev-client-note"><Network/><div><strong>Client is not host</strong><p>HP ZGX Toolkit requires a supported x86 Windows 11 or Ubuntu 24.04 client with VS Code. The ZGX host remains Arm64 Linux.</p></div></div>
  <div className="ev-worksheet"><div><span>Compatibility worksheet</span><h3>Record before the pilot</h3><p>A container does not make an x86 binary Arm-compatible.</p><button type="button" disabled><Download/> Downloadable version coming soon</button></div><ul>{fields.map(item=><li key={item}><i/><span>{item}</span></li>)}</ul></div>
  <ProductDetails nano={{evidence:"pilot",status:"DGX OS · Arm64",items:["Validate every binary, wheel, image, driver, and peripheral","Use exact package versions from the live Toolkit documentation","Test the representative model and end-to-end integrations"]}} fury={{evidence:"preview",status:"Ubuntu · Arm64 · pre-release",items:["Repeat validation for the Fury production stack","Do not infer compatibility from Nano alone","Prove throughput, latency, batching, and concurrent-user behavior"]}}/>
  <Sources links={[["NVIDIA DGX Spark software","https://docs.nvidia.com/dgx/dgx-spark/dgx-os.html"],["HP ZGX Toolkit","https://www.hp.com/us-en/workstations/ai-stations.html"]]}/>
</Stage>}

function Operate(){return <Stage title="Access, manage, and recover" eyebrow="Approval gate 04" answer="Treat user access, IT administration, and out-of-band recovery as three different requirements. A remote console is not a fleet-management platform.">
  <div className="ev-three"><Mini icon={<Network/>} title="User access" text="SSH, VS Code, Jupyter, and approved model or API endpoints."/><Mini icon={<Wrench/>} title="IT administration" text="Imaging, patching, inventory, identity, compliance, and evidence."/><Mini icon={<LifeBuoy/>} title="Out-of-band recovery" text="BIOS, KVM, virtual media, power state, and break-glass access."/></div>
  <ProductDetails nano={{evidence:"confirmed",status:"RSC limitation must be explicit",items:["Optional HP Remote System Controller provides BIOS-level KVM and virtual media","Nano must already be powered on; remote power-on is not supported","Define cloud-init, Landscape or supported endpoint tooling, patch rings, and recovery media"]}} fury={{evidence:"preview",status:"Production operating model required",items:["Named owner and on-call path; RBAC, isolation, quotas, and queueing","Monitoring, alerting, API gateway, secrets, backup, and restore","Capacity thresholds, maintenance, upgrade/rollback, failure domains, and HA expectations"]}}/>
  <Callout title="Multi-user is not an SLA" text="Capacity depends on model size, precision, context length, batching, tokens per second, and latency target. Benchmark the intended workload."/>
</Stage>}

function Deploy(){return <Stage title="Facilities and integration" eyebrow="Approval gate 05" answer="Use the final SKU-specific QuickSpecs as the facilities source of truth. ‘Rack-ready’ marketing is not an orderable rack kit or a validated density design.">
  <ProductDetails nano={{evidence:"validate",status:"Validate source revision",items:["Resolve the public 240 W adapter versus 280 W supply descriptions against current QuickSpecs","Record measured draw, heat, acoustics, placement, service clearance, and cable plan","Confirm network ports, QSFP bend radius, storage, recovery access, and regulated wireless configuration"]}} fury={{evidence:"preview",status:"Final HP QuickSpecs required",items:["Do not use NVIDIA’s 1,600 W GB300 reference budget as HP wall-power specification","Require plug, circuit, heat rejection, acoustics, airflow, dimensions, and service clearance","Confirm shelf/rail part, devices per shelf, PDU and network ports, and crash-cart/BMC method"]}}/>
  <div className="ev-checks"><strong>Deployment record</strong>{["Location","Shelf / rail","Density","Airflow","Input power","Heat + noise","Service clearance","Cabling","PDU + ports","Recovery method"].map(item=><span key={item}><Check/>{item}</span>)}</div>
</Stage>}

function Support(){return <Stage title="Services and accountability" eyebrow="Approval gate 06" answer="Put service ownership and response targets on the quote. Do not infer enterprise coverage from a general support page or assume every Care Pack applies to every ZGX SKU.">
  <div className="ev-owners"><Mini icon={<Headphones/>} title="HP hardware" text="Warranty, repair method, parts, firmware/OEM image, eligible Care Packs, and geography."/><Mini icon={<Cpu/>} title="NVIDIA software" text="DGX OS guidance and separately entitled enterprise software escalation."/><Mini icon={<ShieldCheck/>} title="Customer / integrator" text="Architecture, policy, apps, models, integrations, backup, monitoring, and runbooks."/></div>
  <div className="ev-quote"><div><span>Quote-specific checklist</span><h3>Ask for every line in writing.</h3></div><ul>{["Base warranty and exact SKU","Onsite versus exchange","Response target and parts availability","Defective Media Retention eligibility","Geographic and travel coverage","OS, firmware, NVIDIA, and Toolkit owners","Deployment and onboarding services","Named escalation process"].map(item=><li key={item}><Check/>{item}</li>)}</ul></div>
  <Callout title="Current Nano baseline needs validation" text="The US store listing describes one-year parts-and-labor limited warranty with no onsite repair. Any stronger service level must be confirmed as eligible on the quoted SKU."/>
</Stage>}

function Prove(){return <Stage title="Prove Fury before production" eyebrow="Approval gate 07" answer="Treat a Fury remote sandbox as a governed technical trial—not the same thing as Priority Access or pre-order. Publish the offer only after HP approves its operating terms.">
  <div className="ev-trial"><div><FlaskConical/><span>Pilot required</span><h3>Prove your workload on ZGX Fury before finalizing the architecture.</h3><p>Discovery → mutual success plan → security approval → workload deployment → benchmark → executive readout and TCO → production quote</p><button type="button" disabled>Sandbox program pending approval</button></div><ul>{["Eligible customers and regions","Duration, lead time, dedicated/shared","Remote access and IP allowlisting","Permitted data and egress rules","Model-license responsibility","Retention and wipe attestation","Support hours and limitations","Success criteria and benchmark","Cost and approval process"].map(item=><li key={item}><CircleAlert/>{item}</li>)}</ul></div>
  <Callout title="Promotions belong in a governed feed" text="Do not hard-code store offers. A future card should be geo-aware, dated, SKU-specific, and show eligibility, expiry, exclusions, last verification, and an enterprise-quote CTA."/>
  <Sources links={[["Fury Priority Access","https://www.hp.com/us-en/workstations/ai-stations.html"]]}/>
</Stage>}

function Stage({title,eyebrow,answer,children}:{title:string;eyebrow:string;answer:string;children:React.ReactNode}){return <section className="ev-section"><header><p>{eyebrow}</p><h2>{title}</h2></header><div className="ev-ae"><span>30-second answer</span><p>{answer}</p></div>{children}</section>}
function Status({type}:{type:Evidence}){return <span className={`ev-status ${type}`}>{statusLabels[type]}</span>}
function Product({name,icon,status,statusType,role,specs,gate}:{name:string;icon:"nano"|"fury";status:string;statusType:Evidence;role:string;specs:string[];gate:string}){return <article className={`ev-product ${icon}`}><div className="ev-product-title"><span>{icon==="nano"?<Cpu/>:<Server/>}<b>{name}</b></span><Status type={statusType}/></div><p>{status}</p><h3>{role}</h3><ul>{specs.map(item=><li key={item}><Check/>{item}</li>)}</ul><div><small>Key buying gate</small><strong>{gate}</strong></div></article>}
function ProductDetails({nano,fury}:{nano:{evidence:Evidence;status:string;items:string[]};fury:{evidence:Evidence;status:string;items:string[]}}){return <div className="ev-details"><details open><summary><span><Cpu/>ZGX Nano</span><Status type={nano.evidence}/><ChevronDown/></summary><div><b>{nano.status}</b><ul>{nano.items.map(item=><li key={item}><Check/>{item}</li>)}</ul></div></details><details><summary><span><Server/>ZGX Fury</span><Status type={fury.evidence}/><ChevronDown/></summary><div><b>{fury.status}</b><ul>{fury.items.map(item=><li key={item}><Check/>{item}</li>)}</ul></div></details></div>}
function Mini({icon,title,text}:{icon:React.ReactNode;title:string;text:string}){return <article>{icon}<h3>{title}</h3><p>{text}</p></article>}
function Callout({title,text}:{title:string;text:string}){return <aside className="ev-callout"><CircleAlert/><div><strong>{title}</strong><p>{text}</p></div></aside>}
function Alert({title,text,href}:{title:string;text:string;href:string}){return <aside className="ev-alert"><ShieldCheck/><div><span>Live bulletin</span><strong>{title}</strong><p>{text}</p></div><a href={href} target="_blank" rel="noreferrer">Open bulletin<ExternalLink/></a></aside>}
function Sources({links}:{links:[string,string][]}){return <div className="ev-sources"><span>Official sources</span>{links.map(([label,url])=><a key={url} href={url} target="_blank" rel="noreferrer">{label}<ExternalLink/></a>)}</div>}
function GuideChat({open,setOpen,navigate}:{open:boolean;setOpen:(value:boolean)=>void;navigate:(stage:Stage)=>void}){const prompts:[string,Stage][]=[["Which system fits?","choose"],["Can data stay local?","secure"],["Will our software run?","compatible"],["What must be on the quote?","support"]];return <div className="ev-chat">{open&&<section role="dialog" aria-label="ZGX Guide assistant"><header><span><Bot/></span><div><strong>ZGX Guide</strong><small><i/> Guided preview</small></div><button onClick={()=>setOpen(false)} aria-label="Close assistant"><X/></button></header><div><p>What does your customer need to approve?</p>{prompts.map(([label,target])=><button key={label} onClick={()=>navigate(target)}>{label}<ArrowRight/></button>)}<aside><Sparkles/><span><strong>Knowledge connection comes next.</strong>This preview only navigates approved guide content.</span></aside></div><footer><input disabled placeholder="Ask about enterprise deployment…" aria-label="Ask ZGX Guide"/><button disabled aria-label="Send"><Send/></button></footer></section>}<button className="ev-chat-launch" onClick={()=>setOpen(!open)} aria-label={open?"Close ZGX Guide":"Open ZGX Guide"}>{open?<X/>:<MessageCircle/>}<span>{open?"Close":"Ask ZGX Guide"}</span></button></div>}
