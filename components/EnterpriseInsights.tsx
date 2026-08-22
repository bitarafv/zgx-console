"use client";

import { useState } from "react";
import { ArrowRight, Bot, Building2, Check, Cloud, Cpu, Database, Gauge, Layers3, LockKeyhole, Network, Server, WalletCards, WifiOff } from "lucide-react";

const chapters = [
  { id: "shift", label: "Why local AI" }, { id: "requirements", label: "Requirements" },
  { id: "platform", label: "Platform" }, { id: "use-cases", label: "Use cases" },
  { id: "strategy", label: "Hybrid strategy" },
] as const;
type Chapter = typeof chapters[number]["id"];

const requirements = [
  { icon: LockKeyhole, title: "Data control", text: "Keep sensitive data and model assets within infrastructure governed by the organization." },
  { icon: WalletCards, title: "Cost control", text: "Compare recurring usage charges with a capacity investment that can be planned and measured." },
  { icon: Gauge, title: "Model performance", text: "Size memory, context, and inference speed for the models and agent loops that must remain productive." },
  { icon: Network, title: "Application performance", text: "Plan for concurrent agents alongside the professional tools and services they need to operate." },
  { icon: WifiOff, title: "Continuous availability", text: "Keep critical workflows useful through network interruptions and third-party service outages." },
];

const useCases = [
  { industry: "Financial services", title: "Research and risk agents", text: "Analyze local transaction, market, compliance, and portfolio data while keeping proprietary signals under organizational control." },
  { industry: "Technology", title: "AI engineering assistants", text: "Reason across private codebases and deployment documentation to propose architecture, configuration, and code changes." },
  { industry: "Healthcare", title: "Clinical workflow support", text: "Work with governed patient and research data for summarization, care-gap analysis, and computational discovery." },
  { industry: "Energy", title: "Engineering simulation agents", text: "Coordinate long-running simulation and analysis workflows while keeping subsurface models and operational data local." },
];

export function EnterpriseInsights() {
  const [chapter, setChapter] = useState<Chapter>("shift");
  return <>
    <div className="hero compact insight-hero"><div><p className="eyebrow">ENTERPRISE AI INSIGHTS</p><h1>From AI conversation to <span>continuous action</span></h1><p>A practical field guide for choosing, deploying, and scaling enterprise AI infrastructure.</p></div><div className="insight-orbit"><Bot /><span>Perceive</span><span>Act</span><span>Evaluate</span></div></div>
    <nav className="chapter-nav" aria-label="Insight chapters">{chapters.map((item) => <button key={item.id} className={chapter === item.id ? "active" : ""} onClick={() => setChapter(item.id)}>{item.label}</button>)}</nav>
    {chapter === "shift" && <Shift />}{chapter === "requirements" && <Requirements />}{chapter === "platform" && <Platform />}{chapter === "use-cases" && <UseCases />}{chapter === "strategy" && <Strategy />}
    <p className="source-note">Adapted and paraphrased from the supplied 14-slide enterprise AI presentation. Product claims and publication status require owner review before public release.</p>
  </>;
}

function Shift() { return <div className="insight-story"><section className="story-lead"><p className="eyebrow">THE INFRASTRUCTURE SHIFT</p><h2>Agents turn isolated prompts into persistent workloads.</h2><p>When AI observes, decides, uses software, checks its work, and continues, token demand and infrastructure dependency compound across every loop.</p><div className="agent-loop"><span>Perceive & reason</span><ArrowRight /><span>Execute</span><ArrowRight /><span>Evaluate</span><ArrowRight /><span>Deliver</span></div></section><section className="challenge-panel"><p className="eyebrow">THREE IT PRESSURES</p>{[["01","Predict","Forecast expanding inference demand across agentic workflows."],["02","Provision","Provide responsive compute without queues interrupting workflow continuity."],["03","Control","Keep variable usage and infrastructure cost within an intentional budget."]].map(([n,title,text]) => <article key={n}><strong>{n}</strong><div><h3>{title}</h3><p>{text}</p></div></article>)}</section></div>; }

function Requirements() { return <><div className="section-head insight-heading"><div><p className="eyebrow">DEPLOYMENT CHECKLIST</p><h2>Five requirements to define before choosing compute</h2></div><p>Use these as evaluation criteria—not product promises.</p></div><div className="requirement-grid">{requirements.map((item,index) => <article key={item.title}><span>0{index+1}</span><item.icon /><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></>; }

function Platform() { return <><div className="section-head insight-heading"><div><p className="eyebrow">AN INTEGRATED PLATFORM</p><h2>Hardware, software, and enablement work as one system</h2></div></div><div className="platform-stack"><PlatformCard icon={Cpu} n="01" title="Right-sized hardware" text="Individual ZGX Nano capacity for development and sensitive personal workloads; shared infrastructure for teams and larger concurrent workloads." chips={["Developer systems","Team infrastructure","Scale-out options"]}/><PlatformCard icon={Layers3} n="02" title="AI software foundation" text="Open models, optimized inference services, agent frameworks, and development tools support the path from experiment to governed deployment." chips={["Open models","Agent blueprints","Inference services"]}/><PlatformCard icon={Server} n="03" title="Operational enablement" text="Device discovery, environment setup, model serving, container lifecycle, queue management, and shared GPU capacity reduce operational friction." chips={["Discover","Install","Serve","Manage"]}/></div><div className="workflow-strip">{["Discover","Install","Configure","Serve","Manage"].map((item,index) => <span key={item}><i>{index+1}</i>{item}</span>)}</div></>; }

function PlatformCard({icon:Icon,n,title,text,chips}:{icon:typeof Cpu;n:string;title:string;text:string;chips:string[]}) { return <article><div><Icon/><span>{n}</span></div><h3>{title}</h3><p>{text}</p><div className="chips">{chips.map((chip) => <span key={chip}>{chip}</span>)}</div></article>; }

function UseCases() { return <><div className="section-head insight-heading"><div><p className="eyebrow">INDUSTRY PATTERNS</p><h2>Local AI matters where context is valuable and movement is costly</h2></div></div><div className="use-case-grid">{useCases.map((item) => <article key={item.industry}><p>{item.industry}</p><h3>{item.title}</h3><span>{item.text}</span><div><Check size={14}/> Governed local context</div></article>)}</div></>; }

function Strategy() { return <><div className="section-head insight-heading"><div><p className="eyebrow">PLACEMENT STRATEGY</p><h2>Cloud where scale is unique. Local where control matters.</h2></div></div><div className="strategy-grid"><article className="cloud-card"><Cloud/><p className="eyebrow">FRONTIER CLOUD MODELS</p><h3>Use cloud for exceptional scale</h3><ul><li>Novel reasoning that needs the broadest available model capability</li><li>Burst demand where elastic capacity matters more than predictability</li><li>Experiments whose stable resource profile is not known yet</li></ul></article><div className="decision"><Database/><strong>Choose deliberately</strong><span>Cost</span><span>Sensitivity</span><span>Latency</span><span>Predictability</span></div><article className="local-card"><Building2/><p className="eyebrow">LOCAL ZGX INFRASTRUCTURE</p><h3>Use local for sustained control</h3><ul><li>Known, repeatable agent loops with steady compute demand</li><li>Sensitive data and governance requirements</li><li>High-volume inference where recurring usage costs compound</li><li>Developer iteration that benefits from immediate capacity</li></ul></article></div></>; }

